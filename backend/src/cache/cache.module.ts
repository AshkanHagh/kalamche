import { Module } from "@nestjs/common";
import { RedisCacheStrategy } from "./redis-cache.strategy";
import { CacheService } from "./cache.service";

@Module({
  providers: [RedisCacheStrategy, CacheService],
  exports: [CacheService],
})
export class CacheModule {}
