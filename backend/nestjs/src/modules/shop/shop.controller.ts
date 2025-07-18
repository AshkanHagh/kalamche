import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { IShop, IUser } from "src/drizzle/types";
import { ShopService } from "./shop.service";
import { User } from "../auth/decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  ResourceType,
  SHOP_RESOURCE_ACTION,
} from "src/constants/global.constant";
import { PermissionGuard } from "../auth/guards/permission.guard";
import {
  UpdateShopCreationDto,
  UpdateShopCreationSchema,
  UpdateShopDto,
  UpdateShopSchema,
} from "./dto";
import { IShopController } from "./interfaces/IController";

@Controller("shops")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ShopController implements IShopController {
  constructor(private shopService: ShopService) {}

  @Post("/")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.CREATE)
  async createShop(@User() user: IUser): Promise<IShop> {
    const result = this.shopService.createShop(user);
    return result;
  }

  @Post("/image/:shop_id")
  @UseInterceptors(FileInterceptor("image"))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async uploadImage(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    await this.shopService.uploadImage(userId, shopId, image);
    return;
  }

  @Patch("/complete/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async updateShopCreation(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body(new ZodValidationPipe(UpdateShopCreationSchema))
    payload: UpdateShopCreationDto,
  ): Promise<IShop> {
    return await this.shopService.updateShopCreation(userId, shopId, payload);
  }

  @Delete("/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteShop(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
  ): Promise<void> {
    await this.shopService.deleteShop(userId, shopId);
  }

  @Get("/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getShop(
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
  ): Promise<IShop> {
    return await this.shopService.getShop(shopId);
  }

  @Patch("/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async updateShop(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body(new ZodValidationPipe(UpdateShopSchema)) payload: UpdateShopDto,
  ): Promise<IShop> {
    return await this.shopService.updateShop(userId, shopId, payload);
  }
}
