import { Module } from "@nestjs/common";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";
import { RateLimitModule } from "../rate-limit/rate-limit.module";
import { AttachmentModule } from "../attachment/attachment.module";

@Module({
  imports: [
    AttachmentModule,
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 5,
      refillRate: 1000 * 10,
    }),
  ],
  providers: [ShopService],
  controllers: [ShopController],
})
export class ShopModule {}
