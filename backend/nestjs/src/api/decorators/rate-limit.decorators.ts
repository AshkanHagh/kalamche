import { SetMetadata } from "@nestjs/common";
import { ActionType } from "src/config/rate-limit/rate-limit.service";

export const RATE_LIMIT_METADATA = "rate_limit_action";
export const RateLimit = (actionType: ActionType) => {
  return SetMetadata(RATE_LIMIT_METADATA, actionType);
};
