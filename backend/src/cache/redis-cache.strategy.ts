import Redis from "ioredis";
import { CacheStrategy, JsonCompatible } from "./cache.strategy";
import { Injectable } from "@nestjs/common";

@Injectable()
export class RedisCacheStrategy implements CacheStrategy {
  private readonly client: Redis;

  constructor(redisUrl: string) {
    const redis = new Redis(redisUrl);
    redis.on("error", (err) =>
      console.log(`ERROR: could not connect to redis: ${err}`),
    );
    this.client = redis;
  }

  set<T extends JsonCompatible<T>>(
    key: string,
    value: T,
    expireIn: number,
  ): Promise<void> {
    throw new Error();
  }

  get<T extends JsonCompatible<T>>(key: string): Promise<T | undefined> {
    throw new Error();
  }

  delete(key: string): Promise<void> {
    throw new Error();
  }
}
