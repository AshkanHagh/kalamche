import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule as BaseConfigModule } from "@nestjs/config";
import { dbConfig } from "./db.config";
import { authConfig } from "./auth.config";
import { mailConfig } from "./mail.config";
import { s3Config } from "./s3.config";
import { paymentConfig } from "./payment.config";

@Module({})
export class ConfigModule {
  static register(): Promise<DynamicModule> {
    return BaseConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [dbConfig, authConfig, mailConfig, s3Config, paymentConfig],
    });
  }
}
