import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";
import { ZarinpalPaymentService } from "./services/zarinpal-payment.service";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 3,
      refillRate: 1000 * 60,
    }),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, ZarinpalPaymentService],
})
export class PaymentModule {}
