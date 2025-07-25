import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { RateLimitService } from "../rate-limit.service";
import { Request, Response } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const identifier = this.rateLimitService.extractIdentifier(req);
    if (!identifier) {
      throw new KalamcheError(KalamcheErrorType.RateLimitInvalidIdentifier);
    }

    const result = await this.rateLimitService.checkRateLimit(identifier);
    res.set({
      "X-RateLimit-Remaining": result.remainingTokens.toString(),
      "X-RateLimit-Reset": Math.ceil(
        result.resetTime.getTime() / 1000,
      ).toString(),
    });

    if (!result.allowed) {
      throw new KalamcheError(KalamcheErrorType.RateLimitExceeded);
    }

    return true;
  }
}
