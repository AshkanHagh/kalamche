import { Module } from "@nestjs/common";
import { FrTokenService } from "./fr-token.service";
import { FrTokenController } from "./fr-token.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "ip",
      bucketSize: 20,
      refillRate: 1000 * 60,
    }),
    RepositoryModule,
  ],
  controllers: [FrTokenController],
  providers: [FrTokenService],
})
export class FrTokenModule {}
