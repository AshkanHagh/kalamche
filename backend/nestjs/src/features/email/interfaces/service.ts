import { ISendVerificationAccountEmail } from "../dto";

export interface IEmailService {
  mailTransport(): any;
  sendMail(to: string, subject: string, template: string): Promise<void>;
  sendVerificationAccountEmail(
    payload: ISendVerificationAccountEmail,
  ): Promise<void>;
}
