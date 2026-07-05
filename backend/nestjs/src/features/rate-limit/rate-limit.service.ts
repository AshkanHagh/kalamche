import { Inject, Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import { IRateLimitConfig } from "./types";
import { IRateLimitBucket, RateLimitBucketTable } from "src/drizzle/schemas";
import { IRateLimitService } from "./interfaces/service";
import { RATE_LIMIT_CONFIG } from "./constants";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { eq } from "drizzle-orm";

@Injectable()
export class RateLimitService implements IRateLimitService {
  private logger = new Logger(RateLimitService.name);

  constructor(
    @Inject(DATABASE) private db: Database,
    @Inject(RATE_LIMIT_CONFIG) private config: IRateLimitConfig,
  ) {}

  extractIdentifier(req: Request) {
    switch (this.config.keyExtractor) {
      case "ip": {
        const ip = req.headers["x-forwarded-for"] as string | undefined;
        return ip
          ? ip.split(",")[0].trim()
          : req.socket.remoteAddress || req.connection.remoteAddress;
      }
      case "authorization": {
        return req.headers.authorization;
      }
      case "userId": {
        return req.user?.id;
      }
    }
  }

  async checkRateLimit(identifier: string) {
    let [bucket] = await this.db
      .select()
      .from(RateLimitBucketTable)
      .where(eq(RateLimitBucketTable.identifier, identifier));

    return await this.db.transaction(async (tx) => {
      if (!bucket) {
        const [result] = await tx
          .insert(RateLimitBucketTable)
          .values({
            identifier,
            tokens: this.config.bucketSize,
          })
          .returning();
        bucket = result;
      }

      const tokens = this.calculateTokenRefil(bucket);
      const allowed = tokens > 0;
      const finalTokens = allowed ? tokens - 1 : tokens;
      const resetTime = Math.ceil(
        new Date(Date.now() + this.calculateResetTime(finalTokens)).getTime() /
          1000,
      );

      if (finalTokens !== tokens) {
        await tx
          .update(RateLimitBucketTable)
          .set({
            tokens: finalTokens,
            lastRefil: new Date(),
          })
          .where(eq(RateLimitBucketTable.id, bucket.id))
          .returning();
      }

      if (this.config.mode === "DRY_MODE") {
        this.logger.warn(
          `[DRY_MODE] Rate limit check for ${identifier}: allowed=${allowed}, remaining=${finalTokens}`,
        );
        return {
          allowed: true,
          remainingTokens: finalTokens,
          resetTime,
        };
      }

      return {
        allowed,
        remainingTokens: finalTokens,
        resetTime,
      };
    });
  }

  private calculateTokenRefil(bucket: IRateLimitBucket) {
    const now = Date.now();
    const lastRefil = bucket.lastRefil.getTime();
    const timeSinceLastRefil = Math.max(0, now - lastRefil);

    const tokensToAdd = Math.floor(
      (timeSinceLastRefil * this.config.bucketSize) / this.config.refillRate,
    );

    return Math.min(bucket.tokens + tokensToAdd, this.config.bucketSize);
  }

  private calculateResetTime(currentTokens: number) {
    if (currentTokens >= this.config.bucketSize) {
      return 0;
    }

    const tokenNeeded = this.config.bucketSize - currentTokens;
    return Math.ceil(
      (tokenNeeded / this.config.bucketSize) * this.config.refillRate,
    );
  }
}
