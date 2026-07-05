import { Injectable } from "@nestjs/common";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { MailerService } from "@nestjs-modules/mailer";
import { EmailTemplate, SendMailParams } from "./types";

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendMail<T extends EmailTemplate>(payload: SendMailParams<T>) {
    try {
      await this.mailerService.sendMail(payload);
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.FailedToSendMail, error);
    }
  }
}
