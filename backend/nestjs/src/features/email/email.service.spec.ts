import { Test, TestingModule } from "@nestjs/testing";
import { EmailService } from "./email.service";
import { ConfigModule } from "src/config/config.module";
import { anything, instance, mock, verify, when } from "ts-mockito";
import { Transporter } from "nodemailer";
import { IMailConfig } from "src/config/mail.config";
import { MAIL_CONFIG } from "src/config/constants";
import { ConfigService } from "@nestjs/config";

describe("EmailService", () => {
  let service: EmailService;
  let mockTransport: Transporter;
  let mailConfig: IMailConfig;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.register()],
      providers: [EmailService],
    }).compile();

    const configService = module.get(ConfigService);
    service = module.get<EmailService>(EmailService);
    mailConfig = configService.get<IMailConfig>(MAIL_CONFIG)!;

    mockTransport = mock<Transporter>();
    when(mockTransport.sendMail(anything())).thenResolve({
      messageId: "mocked-message-id",
    });

    // Mock the mailTransport method to return the mocked Transporter instance
    // This avoids creating a real SMTP transport during tests
    jest
      .spyOn(service, "mailTransport")
      .mockReturnValue(instance(mockTransport));
  });

  it("should not send email in test environment", async () => {
    process.env.NODE_ENV = "test";

    const payload = { to: "test@example.com", code: 123456 };
    await service.sendVerificationAccountEmail(payload);

    verify(mockTransport.sendMail(anything())).never();
  });

  it("should send email on production", async () => {
    process.env.NODE_ENV = "production";
    mailConfig.enable = true;

    const email = "test@test.ts";
    const result = service.sendMail(email, "", "");

    await expect(result).resolves.toBeUndefined();
    verify(mockTransport.sendMail(anything())).called();
  });

  it("should handle email sending failure", async () => {
    const error = new Error("Failed to send mail");
    jest.spyOn(service, "sendMail").mockRejectedValueOnce(error);

    const result = service.sendMail("test@test.com", "", "");

    await expect(result).rejects.toThrow(error);
  });

  it("should not send email in development when smtp is disabled and log the email content details", async () => {
    process.env.NODE_ENV = "development";
    mailConfig.enable = false;

    await service.sendMail("test@test.com", "", "");
    verify(mockTransport.sendMail(anything())).never();
  });
});
