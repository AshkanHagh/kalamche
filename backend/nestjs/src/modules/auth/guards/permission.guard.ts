import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import {
  ActionType,
  ResourceType,
  ROLE_PERMISSIONS,
} from "src/constants/global.constant";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skipPermission = this.reflector.get<boolean>(
      "skip-permission",
      context.getHandler(),
    );
    if (skipPermission) {
      return true;
    }

    const requiredPermissions = this.reflector.get<{
      resource: ResourceType;
      action: ActionType;
    }>("permission", context.getHandler());

    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user!;

    const allowedActions = user.roles.flatMap(
      (role) => ROLE_PERMISSIONS[role][requiredPermissions.resource] || [],
    );
    if (!allowedActions.includes(requiredPermissions.action)) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    return true;
  }
}
