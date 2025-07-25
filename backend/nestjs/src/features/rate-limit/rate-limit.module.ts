import { DynamicModule, Global, Module } from "@nestjs/common";
import { IRateLimitConfig } from "./types";
import { RATE_LIMIT_CONFIG_TOKEN } from "./constants";
import { RateLimitService } from "./rate-limit.service";
import { RateLimitGuard } from "./guards/rate-limit.guard";
import { RepositoryModule } from "src/repository/repository.module";

@Module({
  imports: [RepositoryModule],
})
export class RateLimitModule {
  static forFeature(config: IRateLimitConfig): DynamicModule {
    return {
      module: RateLimitModule,
      providers: [
        {
          provide: RATE_LIMIT_CONFIG_TOKEN,
          useValue: config,
        },
        RateLimitService,
        RateLimitGuard,
      ],
      exports: [RateLimitService, RateLimitGuard],
    };
  }
}
