import { Test } from "@nestjs/testing";
import { Request } from "express";
import { ConfigModule } from "src/config/config.module";
import { AuthUtilService } from "src/modules/auth/util.service";
import { EmailService } from "src/modules/email/email.service";
import { PendingUserRepository } from "src/repository/repositories/pending-user.repository";
import { UserLoginTokenRepository } from "src/repository/repositories/user-login-token.repository";
import { UserRepository } from "src/repository/repositories/user.repository";
import { instance, mock } from "ts-mockito";

describe("AuthUtilService", () => {
  let service: AuthUtilService;

  beforeEach(async () => {
    const mockEmailService = mock(EmailService);
    const mockUserRepo = mock(UserRepository);
    const mockPendingUserRepo = mock(PendingUserRepository);
    const mockUserLoginTokenRepo = mock(UserLoginTokenRepository);

    const module = await Test.createTestingModule({
      imports: [ConfigModule.register()],
      providers: [
        AuthUtilService,
        {
          provide: UserRepository,
          useValue: instance(mockUserRepo),
        },
        {
          provide: PendingUserRepository,
          useValue: instance(mockPendingUserRepo),
        },
        {
          provide: UserLoginTokenRepository,
          useValue: instance(mockUserLoginTokenRepo),
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
