import { TestingModule } from "@nestjs/testing";
import { AuthService } from "src/features/auth/auth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { RepositoryService } from "src/repository/repository.service";
import { clearDb, createNestAppInstance } from "test/test.helper";

describe("AuthService", () => {
  let nestModule: TestingModule;
  let service: AuthService;
  let repo: RepositoryService;
  let resendCodeSpy;

  beforeEach(async () => {
    await clearDb();
  });

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    service = nestModule.get(AuthService);
    repo = nestModule.get(RepositoryService);

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

  afterAll(async () => {
    await nestModule.close();
  });
});
