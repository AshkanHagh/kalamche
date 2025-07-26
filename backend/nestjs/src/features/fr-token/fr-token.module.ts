import { Module } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { FrTokenController } from "./fr-token.controller";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { ZarinpalPaymentService } from "./util-services/zarinpal-payment.service";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 3,
      refillRate: 1000 * 60 * 60,
    }),
    AuthModule,
    RepositoryModule,
    DrizzleModule,
  ],
  controllers: [FrTokenController],
  providers: [FrTokenService, ZarinpalPaymentService],
})
export class FrTokenModule {}
