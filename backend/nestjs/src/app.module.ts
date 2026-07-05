import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./features/auth/auth.module";
import { RepositoryModule } from "./repository/repository.module";
import { EmailModule } from "./features/email/email.module";
import { ProductModule } from "./features/product/product.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ShopModule } from "./features/shop/shop.module";
import { UserModule } from "./features/user/user.module";
import { RateLimitModule } from "./features/rate-limit/rate-limit.module";
import { FrTokenModule } from "./features/fr-token/fr-token.module";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationExceptionFilter } from "./filters/zod-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodValidationPipe } from "nestjs-zod";
import { PaymentModule } from "./features/payment/payment.module";

@Module({
  imports: [
    ConfigModule.register(),
    ScheduleModule.forRoot(),
    DrizzleModule,
    AuthModule,
    RepositoryModule,
    EmailModule,
    ProductModule,
    ShopModule,
    UserModule,
    RateLimitModule,
    FrTokenModule,
    PaymentModule,
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
