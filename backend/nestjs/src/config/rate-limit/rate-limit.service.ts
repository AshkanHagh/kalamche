import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/kalamche-error";
import { RateLimitChecker } from "./rate-limit";
import { BucketConfig } from "./types";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "../config.service";

export enum ActionType {
  MESSAGE = "message",
  POST = "post",
  REGISTER = "register",
  IMAGE = "image",
}

@Injectable()
export class RateLimitService {
  private configs: Map<ActionType, BucketConfig> = new Map();

  constructor(private config: ConfigService) {
    this.configs.set(ActionType.MESSAGE, { capacity: 10, secsToRefill: 5 });
    this.configs.set(ActionType.POST, { capacity: 10, secsToRefill: 5 });
    this.configs.set(ActionType.REGISTER, { capacity: 10, secsToRefill: 5 });
    this.configs.set(ActionType.IMAGE, { capacity: 10, secsToRefill: 5 });
  }

  message(): RateLimitChecker {
    return this.createChecker(ActionType.MESSAGE);
  }

  post(): RateLimitChecker {
    return this.createChecker(ActionType.POST);
  }

  register(): RateLimitChecker {
    return this.createChecker(ActionType.REGISTER);
  }

  image(): RateLimitChecker {
    return this.createChecker(ActionType.IMAGE);
  }

  private createChecker(actionType: ActionType): RateLimitChecker {
    const config = this.configs.get(actionType);
    if (!config) {
      throw new KalamcheError(KalamcheErrorType.InvalidRateLimitActionType);
    }
    return new RateLimitChecker(
      actionType,
      config,
      this.config.systemOpitons.cacheStrategy!.instance(),
    );
  }
}
