import { TestingModule } from "@nestjs/testing";
import { AuthService } from "src/features/auth/auth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  clearDb,
  createNestAppInstance,
  createTestPostgresDb,
  createUser,
  stopDb,
} from "test/test.helper";
import { Request, Response } from "express";
import { mock } from "ts-mockito";
import { LoginResponse } from "src/features/auth/types";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { UserLoginTokenTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { migration } from "src/drizzle/migration";
import { UserRepository } from "src/repository/repositories/user.repository";
import { PendingUserRepository } from "src/repository/repositories/pending-user.repository";

describe("AuthService", () => {
  let nestModule: TestingModule;
  let pgContainer: StartedPostgreSqlContainer;
  let service: AuthService;
  let db: Database;
  let userRepository: UserRepository;
  let pendingUserRepository: PendingUserRepository;
  let resendCodeSpy;
  let req: Request;
  let res: Response;

  beforeEach(async () => {
    await clearDb();
  });

  beforeAll(async () => {
    pgContainer = await createTestPostgresDb();
    req = mock<Request>();
    res = mock<Response>();

    res.cookie = jest.fn().mockReturnValue(res);
    await migration();

    nestModule = await createNestAppInstance();
    service = nestModule.get(AuthService);
    userRepository = nestModule.get(UserRepository);
    pendingUserRepository = nestModule.get(PendingUserRepository);
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
      const newPendingUser =
        await pendingUserRepository.findByEmail("john@example.com");

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
      const pendingUser =
        await pendingUserRepository.findByEmail("john@example.com");

      const oneMinPass = new Date(Date.now() - 1000 * 60 * 1);
      await pendingUserRepository.update(pendingUser!.id, {
        createdAt: oneMinPass,
      });

      await service.register({
        email: "john@example.com",
        password: "pwdjohn",
      });

      const updatedPendingUser =
        await pendingUserRepository.findByEmail("john@example.com");

      expect(updatedPendingUser?.createdAt.getTime()).toBeGreaterThan(
        oneMinPass.getTime(),
      );
      expect(updatedPendingUser?.token).not.toBe(pendingUser?.token);
      expect(updatedPendingUser?.id).toBe(pendingUser?.id);
    });
  });

  describe(".resendVerificationCode", () => {
    beforeEach(async () => {
      await pendingUserRepository.insert({
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

      await service.login(res, req, {
        email: "john@example.com",
        password: "pwd",
      });
    });

    it("should not login", async () => {
      // invalid email user not found
      await expect(
        service.login(res, req, {
          email: "wrongEmail@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.InvalidEmailAddress),
      );

      // invalid password
      await expect(
        service.login(res, req, {
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
        service.login(res, req, {
          email: "jane@example.com",
          password: "shhh",
        }),
      ).rejects.toThrow(
        new KalamcheError(KalamcheErrorType.NoPasswordOAuthError),
      );
    });

    it("should bypass account verification and return tokens if login token is within 12 hours", async () => {
      // because we use create user in before each we have a new login token each time
      // so we always get login response type
      const result = (await service.login(res, req, {
        email: "john@example.com",
        password: "pwd",
      })) as LoginResponse;

      expect(result.verificationEmailSent).toBe(false);
      expect(result.user.user).not.toHaveProperty("passwordHash");
    });

    it("should initiate account verification and return token if login token is 12 hours or older", async () => {
      const user = await userRepository.findByEmail("john@example.com");
      const afterTwelveHours = new Date(Date.now() - 1000 * 60 * 60 * 12);
      await db
        .update(UserLoginTokenTable)
        .set({ createdAt: afterTwelveHours })
        .where(eq(UserLoginTokenTable.userId, user!.id));

      const result = await service.login(res, req, {
        email: "john@example.com",
        password: "pwd",
      });

      expect(result.verificationEmailSent).toBe(true);
    });
  });

  afterAll(async () => {
    await nestModule.close();
    await stopDb(db);
    await pgContainer.stop();
  }, 1000 * 20);
});
