import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
// import { CacheStrategy } from "./cache-strategy";

export class RedisCacheStrategy /* implements CacheStrategy */ {
  private readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    const redis = new Redis(config.getOrThrow("REDIS_URL"));
    redis.on("error", (err) =>
      console.log(`ERROR: could not connect to redis: ${err}`),
    );
    this.client = redis;
  }
}
