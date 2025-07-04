import { mock, when, instance, anything, verify } from "ts-mockito";
import { Test } from "@nestjs/testing";
import { AuthUtilService } from "./util.service";
import { RepositoryService } from "src/repository/repository.service";
import { ConfigModule } from "src/config/config.module";
import { PendingUserRepository } from "src/repository/repositories/pending-user";
import { EmailService } from "../email/email.service";
import { Request } from "express";
import { UserLoginTokenRepository } from "src/repository/repositories/user-login-token";

describe("AuthUtilService", () => {
  let service: AuthUtilService;
  let mockTokenRepo: UserLoginTokenRepository;

  beforeEach(async () => {
    const mockRepo = mock(RepositoryService);
    const mockEmailService = mock(EmailService);
    const mockUserLoginTokenRepo = mock(UserLoginTokenRepository);
    const mockPendingUserRepo = mock(PendingUserRepository);
    mockTokenRepo = instance(mockUserLoginTokenRepo);

    when(mockRepo.pendingUser()).thenReturn(instance(mockPendingUserRepo));
    when(mockRepo.userLoginToken()).thenReturn(
      instance(mockUserLoginTokenRepo),
    );
    when(mockUserLoginTokenRepo.insertOrUpdate(anything())).thenResolve(
      anything(),
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

  it("should create and send verification token email and return token", async () => {
    const id = crypto.randomUUID();
    const email = "test@test.com";
    const verificationToken = await service.initiateAccountVerification(
      id,
      email,
    );

    expect(verificationToken).toBeDefined();
  });

  it("should create auth tokens and insert new user login token", async () => {
    when(mock);
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
    verify(mockTokenRepo).called();
  });
});
