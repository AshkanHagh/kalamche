import { Inject, Injectable, Logger } from "@nestjs/common";
import { Request } from "express";
import { IRateLimitConfig } from "./types";
import { IRateLimitBucket } from "src/drizzle/schemas";
import { RateLimitBucketRepository } from "src/repository/repositories/rate-limit-bucket.repository";
import { IRateLimitService } from "./interfaces/IService";
import { RATE_LIMIT_CONFIG } from "./constants";

@Injectable()
export class RateLimitService implements IRateLimitService {
  private logger = new Logger(RateLimitService.name);

  constructor(
    private rateLimitBucketRepository: RateLimitBucketRepository,
    @Inject(RATE_LIMIT_CONFIG) private config: IRateLimitConfig,
  ) {}

  async checkRateLimit(identifier: string) {
    let bucket =
      await this.rateLimitBucketRepository.findByIdentifier(identifier);
    if (!bucket) {
      bucket = await this.rateLimitBucketRepository.insert({
        identifier,
        tokens: this.config.bucketSize,
      });
    }

    const tokens = this.#calculateTokenRefil(bucket);

    const allowed = tokens > 0;
    const finalTokens = allowed ? tokens - 1 : tokens;
    if (finalTokens !== tokens) {
      await this.rateLimitBucketRepository.update(bucket.id, {
        tokens: finalTokens,
        lastRefil: new Date(),
      });
    }

    const resetTime = new Date(
      Date.now() + this.#calculateResetTime(finalTokens),
    );

    if (this.config.mode === "DRY_MODE") {
      this.logger.warn(
        `[DRY_MODE] Rate limit check for ${identifier}: allowed=${allowed}, remaining=${finalTokens}`,
      );
      return { allowed: true, remainingTokens: finalTokens, resetTime };
    }

    return { allowed, remainingTokens: finalTokens, resetTime };
  }

  #calculateTokenRefil(bucket: IRateLimitBucket) {
    const now = Date.now();
    const lastRefil = bucket.lastRefil.getTime();
    const timeSinceLastRefil = Math.max(0, now - lastRefil);

    const tokensToAdd = Math.floor(
      (timeSinceLastRefil * this.config.bucketSize) / this.config.refillRate,
    );

    return Math.min(bucket.tokens + tokensToAdd, this.config.bucketSize);
  }

  #calculateResetTime(currentTokens: number) {
    if (currentTokens >= this.config.bucketSize) {
      return 0;
    }

    const tokenNeeded = this.config.bucketSize - currentTokens;
    return Math.ceil(
      (tokenNeeded / this.config.bucketSize) * this.config.refillRate,
    );
  }

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
}
