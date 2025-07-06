import { TestingModule } from "@nestjs/testing";
import { AuthService } from "src/features/auth/auth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { RepositoryService } from "src/repository/repository.service";
import { clearDb, createNestAppInstance, createUser } from "test/test.helper";
import { Request } from "express";
import { mock } from "ts-mockito";
import { LoginResponse } from "src/features/auth/types";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { UserLoginTokenTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";

describe("AuthService", () => {
  let nestModule: TestingModule;
  let service: AuthService;
  let repo: RepositoryService;
  let db: Database;
  let resendCodeSpy;
  let req: Request;

  beforeEach(async () => {
    await clearDb();
  });

  beforeAll(async () => {
    req = mock<Request>();

    nestModule = await createNestAppInstance();
    service = nestModule.get(AuthService);
    repo = nestModule.get(RepositoryService);
    db = nestModule.get(DATABASE);

    resendCodeSpy = jest.spyOn(service, "resendVerificationCode");
  });

  describe(".register", () => {
    beforeEach(async () => {
      await service.register({
        email: "john@example.com",
        password: "pwdjohn",
      });
    });

    it("should register a new user", async () => {
      const newPendingUser = await repo
        .pendingUser()
        .findByEmail("john@example.com");

      expect(newPendingUser).toBeDefined();
      expect(newPendingUser?.token).toBeDefined();
      expect(newPendingUser?.passwordHash).not.toBe("pwdjohn");
    });

    it("should throw an error if pending user exists within cooldown period", async () => {
      await expect(
        service.register({
          email: "john@example.com",
          password: "pwdjohn",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.RegistrationCooldown),
      );
    });

    it("should updates pending user on retry after cooldown", async () => {
      const pendingUser = await repo
        .pendingUser()
        .findByEmail("john@example.com");

      const oneMinPass = new Date(Date.now() - 1000 * 60 * 1);
      await repo.pendingUser().update(pendingUser!.id, {
        createdAt: oneMinPass,
      });

      await service.register({
        email: "john@example.com",
        password: "pwdjohn",
      });

      const updatedPendingUser = await repo
        .pendingUser()
        .findByEmail("john@example.com");

      expect(updatedPendingUser?.createdAt.getTime()).toBeGreaterThan(
        oneMinPass.getTime(),
      );
      expect(updatedPendingUser?.token).not.toBe(pendingUser?.token);
      expect(updatedPendingUser?.id).toBe(pendingUser?.id);
    });
  });

  describe(".resendVerificationCode", () => {
    beforeEach(async () => {
      await repo.pendingUser().insert({
        email: "john@example.com",
        passwordHash: "pwdjohn",
        token: "",
        createdAt: new Date(Date.now() - 1000 * 60 * 1),
      });

      await service.resendVerificationCode({
        email: "john@example.com",
      });
    });

    it("should not resend verification code", async () => {
      await expect(
        service.resendVerificationCode({
          email: "john@example.com",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.RegistrationCooldown),
      );

      await expect(
        service.resendVerificationCode({
          email: "test@example.com",
        }),
      ).rejects.toThrow(new KalamcheError(KalamcheErrorType.NotRegistered));
    });

    it("should resend verification code", () => {
      expect(resendCodeSpy).toBeCalled();
    });
  });

  // TODO: add resend code cooldown test to
  describe(".login", () => {
    beforeEach(async () => {
      await createUser(nestModule);

      await service.login(req, {
        email: "john@example.com",
        password: "pwd",
      });
    });

    it("should not login", async () => {
      // invalid email user not found
      await expect(
        service.login(req, {
          email: "wrongEmail@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.InvalidEmailAddress),
      );

      // invalid password
      await expect(
        service.login(req, {
          email: "john@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.InvalidEmailAddress),
      );

      // create oauth user
      await createUser(nestModule, true, {
        email: "jane@example.com",
      });
      await expect(
        service.login(req, {
          email: "jane@example.com",
          password: "shhh",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.NoPasswordOAuthError),
      );
    });

    it("should bypass account verification and return tokens if login token is within 12 hours", async () => {
      // because we use create user in before each we have a new login token each time so we always get login response type
      const result = (await service.login(req, {
        email: "john@example.com",
        password: "pwd",
      })) as LoginResponse;

      expect(result.verificationEmailSent).toBe(false);
      expect(result.user.user).not.toHaveProperty("passwordHash");
    });

    it("should initiate account verification and return token if login token is 12 hours or older", async () => {
      const user = await repo.user().findByEmail("john@example.com");
      const afterTwelveHours = new Date(Date.now() - 1000 * 60 * 60 * 12);
      await db
        .update(UserLoginTokenTable)
        .set({ createdAt: afterTwelveHours })
        .where(eq(UserLoginTokenTable.userId, user!.id));

      const result = await service.login(req, {
        email: "john@example.com",
        password: "pwd",
      });

      expect(result.verificationEmailSent).toBe(true);
    });
  });

  afterAll(async () => {
    await nestModule.close();
  });
});
