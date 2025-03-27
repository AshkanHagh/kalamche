import Redis from "ioredis";

export interface SetCacheKeyOptions {
  /**
   * @description
   * The time-to-live for the cache key in milliseconds.
   */
  ttl?: number;
}

/**
 * @description
 * The CacheStrategy defines how the underlying shared cache mechanism is implemented.
 *
 * It is used by the {@link CacheService} to take care of storage and retrieval of items
 * from the cache.
 *
 * If you are using the `RedisCachePlugin`, you will not need to
 * manually specify a CacheStrategy, as these plugins will automatically configure the
 * appropriate strategy.

 * :::info

 * This is configured via the `systemOptions.cacheStrategy` property of
 * your AppConfig.
 */
export interface CacheStrategy {
  /**
   * @description
   * Gets an item from the cache, or returns undefined if the key is not found, or the
   * item has expired.
   */
  get<T>(key: string): Promise<T | undefined>;

  /**
   * @description
   * Sets a key-value pair in the cache. The value must be serializable, so cannot contain
   * things like functions, circular data structures, class instances etc.
   *
   * Optionally a "time to live" (ttl) can be specified, which means that the key will
   * be considered stale after that many milliseconds.
   */
  set<T>(key: string, value: T, options: SetCacheKeyOptions): Promise<void>;

  /**
   * @description
   * Deletes an item from the cache.
   */
  delete(key: string): Promise<void>;

  /**
   * @description
   * Returns the Redis client instance.
   *
   * @returns The current Redis client.
   */
  instance(): Redis;
}
