import Redis from "ioredis";
import {
  CacheStrategy,
  SetCacheKeyOptions,
} from "src/config/system/cache-strategy";
import { RedisCachePluginInitOptions } from "./types";
import { DEFAULT_TTL } from "./constants";

/**
 * @description
 * A {@link CacheStrategy} which stores cached items in a Redis instance.
 * This is a high-performance cache strategy which is suitable for production use.
 */
export class RedisCacheStrategy implements CacheStrategy {
  private client: Redis;

  constructor(private options: RedisCachePluginInitOptions) {
    this.client = new Redis(this.options.redisOptions || {});
    this.client.on("error", (err) => console.log(err));
  }

  public async set<T>(
    key: string,
    value: T,
    options: SetCacheKeyOptions,
  ): Promise<void> {
    try {
      const ttl = options.ttl || DEFAULT_TTL;
      const stringifyValue = JSON.stringify(value);

      await this.client.set(this.namespace(key), stringifyValue, "EX", ttl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(`ERROR: could not set cache item ${key}: ${error.message}`);
      }
    }
  }

  public get<T>(key: string): Promise<T | undefined> {
    throw new Error("TODO: get");
  }

  public delete(key: string): Promise<void> {
    throw new Error("TODO: delete");
  }

  public instance(): Redis {
    return this.client;
  }

  private namespace(key: string) {
    return `kalamche:${key}`;
  }
}
