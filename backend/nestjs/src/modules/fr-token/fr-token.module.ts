import { Module } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { FrTokenController } from "./fr-token.controller";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "ip",
      bucketSize: 20,
      refillRate: 1000 * 60,
    }),
  ],
  controllers: [FrTokenController],
  providers: [FrTokenService],
  exports: [FrTokenService],
})
export class FrTokenModule {}
