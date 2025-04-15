import Redis from "ioredis";
import { ActionType } from "./rate-limit.service";
import { BucketConfig } from "./types";
import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/kalamche-error";

/**
 * @description
 * Represents a timestamp in seconds.
 */
export class InstantSecs {
  constructor(public secs: number) {}

  static now() {
    return new InstantSecs(Math.floor(Date.now() / 1000));
  }
}

export class Bucket {
  constructor(
    public lastChecked: InstantSecs,
    public tokens: number,
  ) {}

  public update(now: InstantSecs, config: BucketConfig): Bucket {
    const secsSinceLastChecked = Math.max(0, now.secs - this.lastChecked.secs);
    const addedTokens =
      (secsSinceLastChecked * config.capacity) / config.secsToRefill;
    const tokens = Math.min(this.tokens + addedTokens, config.capacity);

    return new Bucket(now, tokens);
  }
}

export class RateLimitChecker {
  private key: string | null = null;

  constructor(
    private readonly actionType: ActionType,
    private readonly bucketConfig: BucketConfig,
    private readonly redis: Redis,
  ) {}

  async check(): Promise<boolean> {
    if (!this.key) {
      throw new KalamcheError(KalamcheErrorType.RateLimitError);
    }

    const bucketKey = `${this.key}:${this.actionType}`;
    const lastCheckedKey = `last_checked:${this.key}:${this.actionType}`;

    const now: InstantSecs = InstantSecs.now();

    const [tokens, lastChecked] = await this.redis.mget(
      bucketKey,
      lastCheckedKey,
    );

    const bucket: Bucket = new Bucket(
      {
        secs: lastChecked ? parseInt(lastChecked) : now.secs,
      },
      tokens ? parseInt(tokens) : this.bucketConfig.capacity,
    );

    const updatedBucket = bucket.update(now, this.bucketConfig);
    if (updatedBucket.tokens === 0) {
      return false;
    }

    const newTokens = updatedBucket.tokens - 1;
    await this.redis.mset(bucketKey, newTokens, lastCheckedKey, now.secs);
    return true;
  }

  public forUser(userId: string) {
    this.key = `user:${userId}`;
    return this;
  }

  public forIp(ip: string) {
    this.key = `ip:${ip}`;
    return this;
  }
}
