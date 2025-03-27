import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import {
  ActionType,
  RateLimitService,
} from "src/config/rate-limit/rate-limit.service";
import { Observable } from "rxjs";
import { RateLimitChecker } from "src/config/rate-limit/rate-limit";
import { Request } from "express";
import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/error.exception";
import { RATE_LIMIT_METADATA } from "../decorators/rate-limit.decorators";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private rateLimitService: RateLimitService,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const actionType = this.reflector.get<ActionType>(
      RATE_LIMIT_METADATA,
      context.getHandler(),
    );
    if (!actionType) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const userIp = (req.headers["x-forwarded-for"] as string) || req.ip;
    if (!userIp) {
      throw new KalamcheError(KalamcheErrorType.RateLimitError); // TODO: fix error
    }

    let checker: RateLimitChecker;
    switch (actionType) {
      case ActionType.MESSAGE:
        checker = this.rateLimitService.message();
        break;
      case ActionType.POST:
        checker = this.rateLimitService.post();
        break;
      case ActionType.REGISTER:
        checker = this.rateLimitService.register();
        break;
      case ActionType.IMAGE:
        checker = this.rateLimitService.image();
        break;
    }

    checker.forIp(userIp);
    const passed = await checker.check();
    if (!passed) {
      throw new KalamcheError(KalamcheErrorType.RateLimitError);
    }

    return next.handle();
  }
}
