import Redis from "ioredis";
import { CacheStrategy } from "./cache.strategy";
import { Injectable } from "@nestjs/common";

const DEFAULT_CACHE_TTL = 60 * 15;
const MAX_ITEM_SIZE_IN_BYTES = 10000;

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

  public async set<T>(key: string, value: T, expireIn?: number): Promise<void> {
    try {
      const ttl = expireIn || DEFAULT_CACHE_TTL;
      const stringifyValue = JSON.stringify(value);

      if (Buffer.byteLength(stringifyValue) > MAX_ITEM_SIZE_IN_BYTES) {
        console.log(
          `ERROR: could not set cache item ${key} bytes exceeds limits`,
        );
      }

      await this.client.set(this.namespace(key), stringifyValue, "EX", ttl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`ERROR: could not set cache item ${key}: ${error.message}`);
      }
    }
  }

  public get<T>(key: string): Promise<T | undefined> {
    throw new Error(key);
  }

  public delete(key: string): Promise<void> {
    throw new Error(key);
  }

  public async close() {
    await this.client.quit();
  }

  public async clear() {
    await this.client.del("*");
  }

  private namespace(key: string) {
    return `kalamche:${key}`;
  }
}
