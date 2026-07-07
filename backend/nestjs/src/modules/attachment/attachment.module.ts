import { Module } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { AttachmentController } from "./attachment.controller";
import { S3Service } from "./services/s3.service";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 5,
      refillRate: 1000 * 30,
    }),
  ],
  controllers: [AttachmentController],
  providers: [S3Service, AttachmentService],
  exports: [S3Service],
})
export class AttachmentModule {}
