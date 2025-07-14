import { Controller, Post, UseGuards } from "@nestjs/common";
import { IShopController } from "./interfaces/controller";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { IShop } from "src/drizzle/types";
import { ShopService } from "./shop.service";
import { User } from "../auth/decorators/user.decorator";

@Controller("shops")
@UseGuards(AuthorizationGuard)
export class ShopController implements IShopController {
  constructor(private shopService: ShopService) {}

  @Post("/")
  async createShop(@User("id") userId: string): Promise<IShop> {
    const result = this.shopService.createShop(userId);
    return result;
  }
}
