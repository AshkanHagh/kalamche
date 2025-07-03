import { ConfigType, registerAs } from "@nestjs/config";
import { MAIL_CONFIG } from "./constants";
import { Inject } from "@nestjs/common";

export const mailConfig = registerAs(MAIL_CONFIG, () => {
  return {
    enable: JSON.parse(process.env.SMTP_ENABLE!) as boolean,
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    secure: JSON.parse(process.env.SMTP_TLS_ENABLED!) as boolean,
    sender: process.env.SMTP_SEND_EMAIL,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  };
});

export const MailConfig = () => Inject(mailConfig.KEY);
export type IMailConfig = ConfigType<typeof mailConfig>;
