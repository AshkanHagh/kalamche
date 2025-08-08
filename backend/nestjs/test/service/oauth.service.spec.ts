import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { DATABASE } from "src/drizzle/constants";
import {
  OAuthAccountTable,
  OAuthStateTable,
  UserTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { OAuthUserPayload } from "src/features/auth/oauth/dto";
import { OAuthService } from "src/features/auth/oauth/oauth.service";
import { DiscordOAuthService } from "src/features/auth/oauth/util-services/discrod-oauth.service";
import { GithubOAuthService } from "src/features/auth/oauth/util-services/github-oauth.service";
import { AuthUtilService } from "src/features/auth/util.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  createNestAppInstance,
  createUser,
  truncateTables,
} from "test/test.helper";
import { mock } from "ts-mockito";

describe("OAuthService", () => {
  let nestModule: TestingModule;
  let oauthService: OAuthService;
  let db: Database;
  let githubOAuthService: GithubOAuthService;
  let discordOAuthService: DiscordOAuthService;
  let authUtilService: AuthUtilService;

  const mockReq = mock<Request>();
  const mockRes = mock<Response>();

  mockRes.cookie = jest.fn().mockReturnValue(mockRes);

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    oauthService = nestModule.get(OAuthService);
    db = nestModule.get(DATABASE);
    githubOAuthService = nestModule.get(GithubOAuthService);
    discordOAuthService = nestModule.get(DiscordOAuthService);
    authUtilService = nestModule.get(AuthUtilService);
  });

  beforeEach(async () => {
    await truncateTables(db, UserTable, OAuthStateTable, OAuthAccountTable);
  });

  describe(".initiateOAuth", () => {
    it("should initiate a oauth", async () => {
      await expect(
        oauthService.initiateOAuth(
          faker.helpers.arrayElement(["github", "discord"]),
        ),
      ).resolves.toBeDefined();
    });

    it("should throw error when state is empty", async () => {
      const generateStateSpy = jest
        .spyOn(githubOAuthService, "generateState")
        // @ts-expect-error this method will never return null
        .mockReturnValue(null);

      await expect(oauthService.initiateOAuth("github")).rejects.toThrow();

      generateStateSpy.mockRestore();
    });

    it("should throw error for invalid provider", async () => {
      await expect(
        oauthService.initiateOAuth(faker.word.sample()),
      ).rejects.toThrow();
    });
  });

  describe(".handleCallback", () => {
    let exchangeCodeForTokensSpy: jest.SpyInstance;
    let getUserInfoSpy: jest.SpyInstance;
    const mockGetUserInfo: OAuthUserPayload = {
      email: faker.internet.email(),
      provider: "github",
      name: faker.person.firstName(),
      providerId: randomUUID(),
    };

    beforeEach(() => {
      exchangeCodeForTokensSpy = jest
        .spyOn(githubOAuthService, "exchangeCodeForTokens")
        .mockResolvedValue({
          accessToken: faker.internet.jwt(),
          tokenType: "Bearer ",
        });

      getUserInfoSpy = jest
        .spyOn(githubOAuthService, "getUserInfo")
        .mockResolvedValue(mockGetUserInfo);
    });

    it("should create a new user and OAuth account if no existing account", async () => {
      // Create a state for OAuth (works with any service)
      const state = githubOAuthService.generateState();
      await db.insert(OAuthStateTable).values({
        provider: "github",
        state,
      });

      await expect(
        oauthService.handleCallback(mockReq, mockRes, {
          code: faker.word.sample(),
          provider: "github",
          state,
        }),
      ).resolves.toBeDefined();
    });

    it("should link existing user with OAuth account if found", async () => {
      mockGetUserInfo.email = faker.internet.email();

      const user = await createUser(db, { email: mockGetUserInfo.email });
      // Create a state for OAuth (works with any service)
      const state = discordOAuthService.generateState();
      await db.insert(OAuthStateTable).values({
        provider: "github",
        state,
      });

      const result = await oauthService.handleCallback(mockReq, mockRes, {
        code: faker.word.sample(),
        provider: "github",
        state,
      });

      // Check that no new user was created
      expect(result.user.id).toBe(user.id);

      const [oauthAccount] = await db
        .select()
        .from(OAuthAccountTable)
        .where(eq(OAuthAccountTable.userId, user.id));

      // confirm OAuth account was linked
      expect(oauthAccount).toBeDefined();
      expect(oauthAccount.provider).toBe("github");
    });

    it("should rollback database transaction on error", async () => {
      const generateLoginResSpy = jest
        .spyOn(authUtilService, "generateLoginRes")
        .mockRejectedValue(new Error("generate failed"));

      const state = githubOAuthService.generateState();
      await db.insert(OAuthStateTable).values({
        provider: "github",
        state,
      });

      await expect(
        oauthService.handleCallback(mockReq, mockRes, {
          code: faker.word.sample(),
          provider: "github",
          state,
        }),
      ).rejects.toThrow();

      const [oauthState, user] = await Promise.all([
        db
          .select()
          .from(OAuthStateTable)
          .where(eq(OAuthStateTable.state, state)),
        db
          .select()
          .from(UserTable)
          .where(eq(UserTable.email, mockGetUserInfo.email)),
      ]);
      expect(user[0]).not.toBeDefined();
      expect(oauthState[0]).toBeDefined();

      generateLoginResSpy.mockRestore();
    });

    it("should throw StateExpired if state is older then 10 minutes", async () => {
      const state = discordOAuthService.generateState();
      await db.insert(OAuthStateTable).values({
        provider: "github",
        state,
        createdAt: new Date(Date.now() - 1000 * 60 * 15),
      });

      await expect(
        oauthService.handleCallback(mockReq, mockRes, {
          code: faker.word.sample(),
          provider: "github",
          state,
        }),
      ).rejects.toThrow(new KalamcheError(KalamcheErrorType.StateExpired));
    });

    afterEach(() => {
      getUserInfoSpy.mockRestore();
      exchangeCodeForTokensSpy.mockRestore();
    });
  });

  afterAll(async () => {
    await db.$client?.end();
    await nestModule.close();
  });
});
