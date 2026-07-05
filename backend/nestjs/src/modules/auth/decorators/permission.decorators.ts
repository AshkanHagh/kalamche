import { SetMetadata } from "@nestjs/common";
import { ActionType, ResourceType } from "src/constants/global.constant";

export const Permission = (resource: ResourceType, action: ActionType) =>
  SetMetadata("permission", { resource, action });
