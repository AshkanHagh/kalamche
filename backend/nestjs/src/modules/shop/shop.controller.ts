import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { ShopService } from "./shop.service";
import { User } from "../auth/decorators/user.decorator";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  ResourceType,
  SHOP_RESOURCE_ACTION,
} from "src/constants/global.constant";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { CreateShopDto, PaginationDto, UpdateShopDto } from "./dto";
import { IShop } from "src/drizzle/schemas";

@Controller("shops")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Post("")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.CREATE)
  async createShop(@User("id") userId: string, @Body() payload: CreateShopDto) {
    return await this.shopService.createShop(userId, payload);
  }

  @Delete("")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShop(@User("id") userId: string) {
    await this.shopService.deleteShop(userId);
  }

  @Patch("")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async updateShop(@User("id") userId: string, @Body() payload: UpdateShopDto) {
    return await this.shopService.updateShop(userId, payload);
  }

  @Get("products")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getProducts(
    @User("id") userId: string,
    @Query() params: PaginationDto,
  ) {
    return await this.shopService.getProducts(userId, params);
  }

  @Get("")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getMyShop(@User("id") userId: string): Promise<IShop> {
    return await this.shopService.getMyShop(userId);
  }
}
