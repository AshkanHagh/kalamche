/**
 * @description
 * Configuration options for the {@link RedisCachePlugin}.
 */
export interface RedisCachePluginInitOptions {
  /**
   * @description
   * The maximum size of a single cache item in bytes. If a cache item exceeds this size, it will not be stored
   * and an error will be logged.
   *
   * @default 128kb
   */
  maxItemSizeInBytes?: number;
  /**
   * @description
   * The namespace to use for all keys stored in Redis. This can be useful if you are sharing a Redis instance
   * between multiple applications.
   *
   * @default 'kalamche-cache'
   */
  namespace?: string;
  /**
   * @description
   * Options to pass to the `ioredis` Redis client.
   */
  redisOptions?: import("ioredis").RedisOptions;

  /**
   * @description
   * The connection URL used to connect to the Redis server.
   * This should follow the standard Redis URI format (e.g., `redis://localhost:6379`).
   */
  connectionUrl: string;
}
