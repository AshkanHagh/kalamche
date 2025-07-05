import { Test } from "@nestjs/testing";
import { Request } from "express";
import { ConfigModule } from "src/config/config.module";
import { AuthUtilService } from "src/features/auth/util.service";
import { EmailService } from "src/features/email/email.service";
import { PendingUserRepository } from "src/repository/repositories/pending-user";
import { UserLoginTokenRepository } from "src/repository/repositories/user-login-token";
import { RepositoryService } from "src/repository/repository.service";
import { instance, mock, when } from "ts-mockito";

describe("AuthUtilService", () => {
  let service: AuthUtilService;

  beforeEach(async () => {
    const mockRepo = mock(RepositoryService);
    const mockEmailService = mock(EmailService);

    when(mockRepo.pendingUser()).thenReturn(
      instance(mock(PendingUserRepository)),
    );
    when(mockRepo.userLoginToken()).thenReturn(
      instance(mock(UserLoginTokenRepository)),
    );

    const module = await Test.createTestingModule({
      imports: [ConfigModule.register()],
      providers: [
        AuthUtilService,
        {
          provide: RepositoryService,
          useValue: instance(mockRepo),
        },
        {
          provide: EmailService,
          useValue: instance(mockEmailService),
        },
      ],
    }).compile();

    service = module.get(AuthUtilService);
  });

  describe(".initiateAccountVerification", () => {
    it("should generate verification token and send to user email", async () => {
      const id = crypto.randomUUID();
      const email = "test@test.com";
      const verificationToken = await service.initiateAccountVerification(
        id,
        email,
      );

      expect(verificationToken).toBeDefined();
    });
  });

  describe(".refreshToken", () => {
    it("should generate auth tokens and store user login token", async () => {
      const req = {
        ip: null,
        headers: [],
        connection: {
          remoteAddress: null,
        },
      } as unknown as Request;

      const result = service.refreshToken(req, crypto.randomUUID());
      await expect(result).resolves.toBeDefined();

      const tokens = await result;
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
    });
  });
});
