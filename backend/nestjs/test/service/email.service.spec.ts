import { faker } from "@faker-js/faker/.";
import { TestingModule } from "@nestjs/testing";
import { Transporter } from "nodemailer";
import { EmailService } from "src/features/email/email.service";
import { createNestAppInstance } from "test/test.helper";
import { instance, mock } from "ts-mockito";

describe("EmailService", () => {
  let nestModule: TestingModule;
  let emailService: EmailService;
  let spyTransporter: jest.SpyInstance;

  beforeAll(async () => {
    nestModule = await createNestAppInstance();
    emailService = nestModule.get(EmailService);
  });

  describe(".sendMail", () => {
    beforeEach(() => {
      const mockNodeMailerTransporter = mock<Transporter>();

      spyTransporter = jest
        .spyOn(emailService, "mailTransport")
        // eslint-disable-next-line
        .mockReturnValue(instance(mockNodeMailerTransporter));
    });

    it("should sends email", async () => {
      const htmlContent = `
        <div>
          <h1>${faker.person.fullName()}</h1>
          <p>Content: ${faker.word.sample()}</p>
        </div>
      `;

      await emailService.sendMail(
        faker.internet.email(),
        faker.word.sample(),
        htmlContent,
      );

      expect(spyTransporter).toHaveBeenCalled();
      spyTransporter.mockReset();
    });

    it("should logs email in development mode", async () => {
      const htmlContent = `
        <div>
          <h1>${faker.person.fullName()}</h1>
          <p>Content: ${faker.word.sample()}</p>
        </div>
      `;

      // Set env to development to avoid sending emails
      process.env.NODE_ENV = "development";
      await emailService.sendMail(
        faker.internet.email(),
        faker.word.sample(),
        htmlContent,
      );

      expect(spyTransporter).not.toHaveBeenCalled();
      spyTransporter.mockReset();
    });

    afterEach(() => {
      process.env.NODE_ENV = "test";
    });
  });

  afterAll(async () => {
    await nestModule.close();
  });
});
