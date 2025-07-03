import { mock, when, instance } from "ts-mockito";
import { Test } from "@nestjs/testing";
import { AuthUtilService } from "./util.service";
import { RepositoryService } from "src/repository/repository.service";
import { ConfigModule } from "src/config/config.module";
import { PendingUserRepository } from "src/repository/repositories/pending-user";
import { EmailService } from "../email/email.service";

describe("AuthUtilService", () => {
  let service: AuthUtilService;

  beforeEach(async () => {
    const mockRepo = mock(RepositoryService);
    const pendingUserRepo = mock(PendingUserRepository);
    const mockEmailService = mock(EmailService);

    when(mockRepo.pendingUser()).thenReturn(pendingUserRepo);

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
});
