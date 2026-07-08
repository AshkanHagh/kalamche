import { DynamicModule, Module } from "@nestjs/common";
import { IRateLimitConfig } from "./types";
import { RateLimitService } from "./rate-limit.service";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { RATE_LIMIT_CONFIG } from "./constants";

@Module({})
export class RateLimitModule {
  static forFeature(config: IRateLimitConfig): DynamicModule {
    return {
      module: RateLimitModule,
      providers: [
        {
          provide: RATE_LIMIT_CONFIG,
          useValue: config,
        },
        RateLimitService,
        RateLimitGuard,
      ],
      exports: [RateLimitService, RateLimitGuard],
    };
  }
}
