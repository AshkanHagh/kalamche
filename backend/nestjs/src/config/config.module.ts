import { Module } from "@nestjs/common";
import { ConfigService } from "./config.service";
import { RateLimitService } from "./rate-limit/rate-limit.service";

@Module({
  providers: [ConfigService, RateLimitService],
  exports: [ConfigService, RateLimitService],
})
export class ConfigModule {}
