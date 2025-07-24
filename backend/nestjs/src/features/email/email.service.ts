import { Injectable } from "@nestjs/common";
import { IEmailService } from "./interfaces/IService";
import { IMailConfig, MailConfig } from "src/config/mail.config";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ISendVerificationAccountEmail } from "./dto";

@Injectable()
export class EmailService implements IEmailService {
  constructor(@MailConfig() private mailConfig: IMailConfig) {}

  mailTransport() {
    let smtpConfig: SMTPTransport.Options;

    if (process.env.NODE_ENV === "development") {
      smtpConfig = {
        host: "127.0.0.1",
        secure: false,
        port: 1025,
      };
    } else {
      smtpConfig = {
        host: this.mailConfig.host,
        sender: this.mailConfig.sender,
        secure: this.mailConfig.secure,
        port: this.mailConfig.port,
        auth: {
          user: this.mailConfig.auth.user,
          pass: this.mailConfig.auth.pass,
        },
      };
    }

    return nodemailer.createTransport(smtpConfig);
  }

  async sendMail(to: string, subject: string, template: string) {
    const mailOptions = {
      from: this.mailConfig.sender,
      to,
      subject,
      html: template,
    };

    // Skip sending email if test env or production and smtp disabled
    if (
      process.env.NODE_ENV === "test" ||
      (process.env.NODE_ENV !== "development" && !this.mailConfig.enable)
    ) {
      return;
    }

    try {
      if (process.env.NODE_ENV === "development" && !this.mailConfig.enable) {
        console.log("Captured email");
        console.log("to: ", to);
        console.log("Subject: ", subject);
        console.log("content: ", template);
      } else {
        const transport = this.mailTransport();
        const result = await transport.sendMail(mailOptions);

        console.log("Message sent: %s", result);
      }
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.FailedToSendMail, error);
    }
  }

  async sendVerificationAccountEmail(
    payload: ISendVerificationAccountEmail,
  ): Promise<void> {
    const subject = `welcome to kalamche verify your account ${payload.code}`;
    const template = `
      <h1>h</h1>
    `;

    await this.sendMail(payload.to, subject, template);
  }
}
