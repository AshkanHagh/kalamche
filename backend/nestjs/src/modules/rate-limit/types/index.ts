export interface IRateLimitConfig {
  bucketSize: number;
  refillRate: number;
  mode: "LIVE" | "DRY_MODE";
  keyExtractor: "userId" | "ip" | "authorization";
}
