import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ProductUtilService } from "./util.service";
import { AttachmentModule } from "../attachment/attachment.module";
import { RateLimitModule } from "../rate-limit/rate-limit.module";
import { MeilisearchService } from "./services/meilisearch.service";

@Module({
  imports: [
    AttachmentModule,
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 100,
      refillRate: 1000 * 60,
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService, ProductUtilService, MeilisearchService],
})
export class ProductModule {}
