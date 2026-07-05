import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/adapters/handlebars.adapter";
import { IMailConfig, mailConfig } from "src/config/mail.config";
import { join } from "node:path";

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [mailConfig.KEY],
      useFactory: (mailConfig: IMailConfig) => ({
        transport: {
          host: mailConfig.host,
          port: mailConfig.port,
          auth: {
            user: mailConfig.auth.user,
            pass: mailConfig.auth.pass,
          },
          secure: mailConfig.secure,
        },
        defaults: {
          from: mailConfig.sender,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
