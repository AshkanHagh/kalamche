import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "../../src/features/email/email.service";
import { ConfigModule } from "src/config/config.module";
import { anything, instance, mock, verify } from "ts-mockito";
import { Transporter } from "nodemailer";
import { IMailConfig } from "src/config/mail.config";
import { MAIL_CONFIG } from "src/config/constants";
import { ConfigService } from "@nestjs/config";

describe("EmailService", () => {
  let service: EmailService;
  let mockTransport: Transporter;
  let mailConfig: IMailConfig;

  beforeEach(async () => {
    mockTransport = mock<Transporter>();

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.register()],
      providers: [EmailService],
    }).compile();

    const configService = module.get(ConfigService);
    service = module.get<EmailService>(EmailService);
    mailConfig = configService.get<IMailConfig>(MAIL_CONFIG)!;

    jest
      .spyOn(service, "mailTransport")
      .mockReturnValue(instance(mockTransport));

    // re value each time to be on test
    process.env.NODE_ENV = "test";
  });

  describe(".sendMail", () => {
    it("should send email on production", async () => {
      process.env.NODE_ENV = "production";
      mailConfig.enable = true;

      const result = service.sendMail("test@test.ts", "", "");

      await expect(result).resolves.toBeUndefined();
      verify(mockTransport.sendMail(anything())).called();
    });

    it("should log email content without sending in development when SMTP is disabled", async () => {
      process.env.NODE_ENV = "development";
      mailConfig.enable = false;

      await service.sendMail("test@test.com", "", "");
      verify(mockTransport.sendMail(anything())).never();
    });

    it("should skip email sending in test environment", async () => {
      await service.sendMail("test@example.com", "", "");
      verify(mockTransport.sendMail(anything())).never();
    });
  });
});
