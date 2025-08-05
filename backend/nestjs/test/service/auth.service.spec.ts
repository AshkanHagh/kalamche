import { TestingModule } from "@nestjs/testing";
import { AuthService } from "src/features/auth/auth.service";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { PendingUserTable, UserTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { createNestAppInstance, truncateTables } from "test/test.helper";
import { faker } from "@faker-js/faker/.";
import * as jwt from "jsonwebtoken";
import { RESEND_CODE_COOLDOWN } from "src/features/auth/constants";
import { KalamcheErrorType } from "src/filters/exception";

describe("AuthService", () => {
  let nestModule: TestingModule;
  let authService: AuthService;
  let db: Database;

  beforeEach(async () => {
    await truncateTables(db, UserTable);
  });

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    authService = nestModule.get(AuthService);
    db = nestModule.get(DATABASE);
  });

  describe(".register", () => {
    it("should register a new pending user", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();

      const verificationToken = await authService.register({
        email,
        password,
      });

      // verify verification token is valid and the pending user id is correct
      const verificationTokenPayload = jwt.verify(
        verificationToken,
        process.env.VERIFICATION_TOKEN_SECRET!,
      ) as { userId: string; code: number };

      const [pendingUser] = await db
        .select()
        .from(PendingUserTable)
        .where(eq(PendingUserTable.id, verificationTokenPayload.userId));

      expect(pendingUser).toBeDefined();
      expect(pendingUser.email).toBe(email);
      // On register the initial value for token is set to empty string
      expect(pendingUser.token).not.toBe("");
      expect(pendingUser.token).toBe(verificationToken);
      // expect user password to be hashed
      expect(pendingUser.passwordHash).not.toBe(password);
    });

    it("should reject registration if cooldown period has not elapsed", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      await db.insert(PendingUserTable).values({
        email,
        // Register fn wont validate user password
        passwordHash: password,
        // fake random token register wont check if cool down passed it would update the token
        token: faker.internet.jwt(),
      });

      await expect(
        authService.register({
          email,
          password,
        }),
      ).rejects.toThrow(KalamcheErrorType.RegistrationCooldown);
    });

    it("should update pending user token when registration cooldown duration has passed", async () => {
      const email = faker.internet.email();
      const password = faker.internet.password();
      await db.insert(PendingUserTable).values({
        email,
        // Register fn wont validate user password
        passwordHash: password,
        // fake random token register wont check if cool down passed it would update the token
        token: faker.internet.jwt(),
        // elapsed duration
        createdAt: new Date(
          Date.now() - 1000 * 60 * (RESEND_CODE_COOLDOWN + 5),
        ),
      });

      await expect(
        authService.register({
          email,
          password,
        }),
      ).resolves.not.toThrow(KalamcheErrorType.RegistrationCooldown);
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
