import { Injectable } from "@nestjs/common";
import { RedisCacheStrategy } from "./redis-cache.strategy";

@Injectable()
export class CacheService {
  constructor(private readonly cacheStrategy: RedisCacheStrategy) {}
}
