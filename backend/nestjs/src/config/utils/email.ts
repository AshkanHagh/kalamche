import { EmailOptions } from "../app.config";
import * as nodemailer from "nodemailer";

export interface VerificationEmail {
  email: string;
  redirectUrl: string;
  code: string;
}

export class NodemailerSendEmail {
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: EmailOptions) {
    const auth: NodemailerAuth | undefined = this.config.user
      ? {
          user: this.config.user,
          pass: this.config.password!,
        }
      : undefined;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.tls,
      auth,
    });
  }

  public async sendVerificationEmail(payload: VerificationEmail) {
    await this.transporter.sendMail({
      from: this.config.email,
      to: payload.email,
      subject: "verification email",
      text: "verification email",
      html: `<h1>${payload.redirectUrl}?code=${payload.code}</h1>`,
    });
  }
}

type NodemailerAuth = {
  user: string;
  pass: string;
};
