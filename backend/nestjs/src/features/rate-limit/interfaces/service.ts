import { Request } from "express";

export interface IRateLimitService {
  checkRateLimit(identifier: string): Promise<{
    allowed: boolean;
    remainingTokens: number;
    resetTime: number;
  }>;
  extractIdentifier(req: Request): string | undefined;
}
