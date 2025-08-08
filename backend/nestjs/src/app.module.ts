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
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "./utils/zod-validation.pipe";

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
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
