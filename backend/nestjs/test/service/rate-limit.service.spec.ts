import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { Request } from "express";
import { randomUUID } from "node:crypto";
import { DATABASE } from "src/drizzle/constants";
import { RateLimitBucketTable } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { RateLimitService } from "src/features/rate-limit/rate-limit.service";
import { RateLimitBucketRepository } from "src/repository/repositories/rate-limit-bucket.repository";
import { createNestAppInstance, truncateTables } from "test/test.helper";

describe("RateLimitService", () => {
  let nestModule: TestingModule;
  let rateLimitService: RateLimitService;
  let db: Database;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();

    db = nestModule.get(DATABASE);
    rateLimitService = new RateLimitService(
      nestModule.get(RateLimitBucketRepository),
      {
        bucketSize: 10,
        // set to live to retrieve errors
        mode: "LIVE",
        // dose not important use any
        keyExtractor: "ip",
        // 1m
        refillRate: 1000 * 60,
      },
    );
  });

  beforeEach(async () => {
    await truncateTables(db, RateLimitBucketTable);
  });

  describe(".checkRateLimit", () => {
    it("should return true if rate limit is not exceeded", async () => {
      const userIp = faker.internet.ipv4();

      await db.insert(RateLimitBucketTable).values({
        identifier: userIp,
        tokens: 1,
      });

      const result = await rateLimitService.checkRateLimit(userIp);
      expect(result.allowed).toBe(true);
      expect(result.remainingTokens).toBe(0);
      expect(result.resetTime.getTime()).toBeGreaterThan(Date.now());
    });

    it("should rollback database transaction on any failure", async () => {
      const rateLimitRepo = nestModule.get(RateLimitBucketRepository);
      const bucketUpdateSpy = jest
        .spyOn(rateLimitRepo, "update")
        .mockRejectedValue(new Error("failed to update bucket"));

      const userIp = faker.internet.ipv4();

      await expect(rateLimitService.checkRateLimit(userIp)).rejects.toThrow();
      // making sure the error comes from calculateResetTime method
      expect(bucketUpdateSpy).toHaveBeenCalled();

      // Check if a rate limit bucket exists for the user IP. If it doesn't, the checkRateLimit method
      // inserts a bucket by default. Any database errors trigger a rollback.
      const [bucket] = await db
        .select()
        .from(RateLimitBucketTable)
        .where(eq(RateLimitBucketTable.identifier, userIp));
      expect(bucket).not.toBeDefined();

      bucketUpdateSpy.mockRestore();
    });

    it("should not consume any tokens when rate limit not executed", async () => {
      const userIp = faker.internet.ipv4();

      await db.insert(RateLimitBucketTable).values({
        identifier: userIp,
        tokens: 0,
      });

      const result = await rateLimitService.checkRateLimit(userIp);
      expect(result.allowed).toBe(false);
      expect(result.remainingTokens).toBe(0);

      const [bucket] = await db
        .select()
        .from(RateLimitBucketTable)
        .where(eq(RateLimitBucketTable.identifier, userIp));

      expect(bucket).toBeDefined();
      // check that tokens has not updated
      expect(bucket.tokens).toBe(0);
    });
  });

  describe(".extractIdentifier", () => {
    let rateLimitService: RateLimitService;
    let mockReq: {
      ip: string | undefined;
      headers: Record<string, string | undefined>;
      socket: { remoteAddress: string | undefined };
      user: { id: string } | undefined;
    };

    beforeEach(() => {
      mockReq = {
        ip: undefined,
        headers: {},
        socket: { remoteAddress: undefined },
        user: undefined,
      };
    });

    describe("when keyExtractor is ip", () => {
      beforeEach(() => {
        rateLimitService = new RateLimitService(
          nestModule.get(RateLimitBucketRepository),
          {
            bucketSize: 10,
            // set to live to retrieve errors
            mode: "LIVE",
            // dose not important use any
            keyExtractor: "ip",
            // 1m
            refillRate: 1000 * 60,
          },
        );
      });

      it("should return req.ip if defined", () => {
        const userIp = faker.internet.ip();
        mockReq.ip = userIp;

        const result = rateLimitService.extractIdentifier(
          mockReq as unknown as Request,
        );

        expect(result).toBe(userIp);
      });

      it("should fallback to x-forwarded-for if req.ip is undefined", () => {
        const userIp = faker.internet.ip();

        mockReq.ip = undefined;
        mockReq.headers["x-forwarded-for"] = userIp;

        const result = rateLimitService.extractIdentifier(
          mockReq as unknown as Request,
        );
        expect(result).toBe(userIp);
      });

      it("should fallback to socket.remoteAddress if both req.ip and x-forwarded-for are undefined", () => {
        const userIp = faker.internet.ip();

        mockReq.ip = undefined;
        mockReq.headers["x-forwarded-for"] = undefined;
        mockReq.socket.remoteAddress = userIp;

        const result = rateLimitService.extractIdentifier(
          mockReq as unknown as Request,
        );
        expect(result).toBe(userIp);
      });
    });

    describe("when keyExtractor is authorization", () => {
      beforeEach(() => {
        rateLimitService = new RateLimitService(
          nestModule.get(RateLimitBucketRepository),
          {
            bucketSize: 10,
            // set to live to retrieve errors
            mode: "LIVE",
            // dose not important use any
            keyExtractor: "authorization",
            // 1m
            refillRate: 1000 * 60,
          },
        );
      });

      it("should return authorization header if defined", () => {
        const bearerToken = `Bearer ${faker.internet.jwt()}`;
        mockReq.headers["authorization"] = bearerToken;

        const result = rateLimitService.extractIdentifier(
          mockReq as unknown as Request,
        );
        expect(result).toBe(bearerToken);
      });
    });

    describe("when keyExtractor is userId", () => {
      beforeEach(() => {
        rateLimitService = new RateLimitService(
          nestModule.get(RateLimitBucketRepository),
          {
            bucketSize: 10,
            // set to live to retrieve errors
            mode: "LIVE",
            // dose not important use any
            keyExtractor: "userId",
            // 1m
            refillRate: 1000 * 60,
          },
        );
      });

      it("should return userId if defined", () => {
        const userId = randomUUID();
        mockReq.user = { id: userId };

        const result = rateLimitService.extractIdentifier(
          mockReq as unknown as Request,
        );
        expect(result).toBe(userId);
      });
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
