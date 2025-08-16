import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { IUserController } from "./interfaces/IController";
import { User } from "../auth/decorators/user.decorator";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";

@Controller("users")
@UseGuards(AuthorizationGuard)
export class UserController implements IUserController {
  constructor(private userService: UserService) {}

  @Get("/me")
  async me(@User("id") userId: string) {
    return await this.userService.me(userId);
  }

  @Get("/products/:product_id/like-status")
  async likeStatus(
    @User("id") userId: string,
    @Param("product_id", new ParseUUIDPipe()) productId: string,
  ): Promise<{ liked: boolean }> {
    const result = await this.userService.likeStatus(userId, productId);
    return { liked: result };
  }
}
