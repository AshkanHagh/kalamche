import Redis from "ioredis";
import {
  CacheStrategy,
  SetCacheKeyOptions,
} from "src/config/system/cache-strategy";
import { RedisCachePluginInitOptions } from "./types";

/**
 * @description
 * A {@link CacheStrategy} which stores cached items in a Redis instance.
 * This is a high-performance cache strategy which is suitable for production use.
 */
export class RedisCacheStrategy implements CacheStrategy {
  private client: Redis;

  constructor(private options: RedisCachePluginInitOptions) {}

  init() {
    this.client = new Redis(this.options.redisOptions || {});
    this.client.on("error", (err) => console.log(err));
  }

  set<T>(key: string, value: T, options: SetCacheKeyOptions): Promise<void> {
    throw new Error("TODO: get");
  }

  get<T>(key: string): Promise<T | undefined> {
    throw new Error("TODO: get");
  }

  delete(key: string): Promise<void> {
    throw new Error("TODO: delete");
  }
}
