import { Request } from "express";

export interface IRateLimitService {
  checkRateLimit(
    identifier: string,
  ): Promise<{ allowed: boolean; remainingTokens: number; resetTime: Date }>;
  extractIdentifier(req: Request): string | undefined;
}
