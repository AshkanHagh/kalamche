import { SetMetadata } from "@nestjs/common";

export interface RateLimitDecoratorOptions {
  bucketSize?: number;
  refillRate?: number;
  refillInterval?: number;
  keyExtractor?: "userId" | "ip" | "authorization";
}

export const RateLimit = (options?: RateLimitDecoratorOptions) =>
  SetMetadata("rate_limit", options);
