import { Controller, Get, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { IUserController } from "./interfaces/IController";
import { IUser, IUserRecord } from "src/drizzle/types";
import { User } from "../auth/decorators/user.decorator";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  ResourceType,
  USER_RESOURCE_ACTION,
} from "src/constants/global.constant";

@Controller("users")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class UserController implements IUserController {
  constructor(private userService: UserService) {}

  @Get("/me")
  @Permission(ResourceType.USER, USER_RESOURCE_ACTION.READ)
  getCurrentUser(@User() user: IUser): IUserRecord {
    const { passwordHash, updatedAt, ...rest } = user;
    return rest;
  }
}
