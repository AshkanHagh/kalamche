import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { RateLimitModule } from "../rate-limit/rate-limit.module";

@Module({
  imports: [
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 10,
      refillRate: 1000 * 60,
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
