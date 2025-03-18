import { Module } from "@nestjs/common";
import { RedisCacheStrategy } from "./redis-cache.strategy";

@Module({
  providers: [RedisCacheStrategy],
})
export class CacheModule {}
