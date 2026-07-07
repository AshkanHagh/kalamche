import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { EmailModule } from "./modules/email/email.module";
import { ProductModule } from "./modules/product/product.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ShopModule } from "./modules/shop/shop.module";
import { UserModule } from "./modules/user/user.module";
import { RateLimitModule } from "./modules/rate-limit/rate-limit.module";
import { FrTokenModule } from "./modules/fr-token/fr-token.module";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationExceptionFilter } from "./filters/zod-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodValidationPipe } from "nestjs-zod";
import { PaymentModule } from "./modules/payment/payment.module";
import { AttachmentModule } from "./modules/attachment/attachment.module";

@Module({
  imports: [
    ConfigModule.register(),
    ScheduleModule.forRoot(),
    DrizzleModule,
    AuthModule,
    EmailModule,
    ProductModule,
    ShopModule,
    UserModule,
    RateLimitModule,
    FrTokenModule,
    PaymentModule,
    AttachmentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
