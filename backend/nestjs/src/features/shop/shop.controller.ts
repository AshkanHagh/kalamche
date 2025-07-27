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
import { IShop, IShopRecord } from "src/drizzle/types";
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
  UploadImageDto,
  UploadImageSchema,
} from "./dto";
import { IShopController } from "./interfaces/IController";
import { ITempShop } from "src/drizzle/schemas";

@Controller("shops")
@UseGuards(AuthorizationGuard, PermissionGuard)
export class ShopController implements IShopController {
  constructor(private shopService: ShopService) {}

  @Post("/")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.CREATE)
  async createShop(@User("id") userId: string): Promise<ITempShop> {
    const result = this.shopService.createShop(userId);
    return result;
  }

  @Post("/images/:shopId/:isTempShop")
  @UseInterceptors(FileInterceptor("image"))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async uploadImage(
    @User("id") userId: string,
    @Param(new ZodValidationPipe(UploadImageSchema)) params: UploadImageDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    await this.shopService.uploadImage(userId, params, image);
    return;
  }

  @Patch("/complete/:temp_shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async completeShopCreation(
    @User("id") userId: string,
    @Param("temp_shop_id", new ParseUUIDPipe()) tempShopId: string,
    @Body(new ZodValidationPipe(UpdateShopCreationSchema))
    payload: UpdateShopCreationDto,
  ): Promise<IShop> {
    return await this.shopService.completeShopCreation(
      userId,
      tempShopId,
      payload,
    );
  }

  @Delete("/temp/:temp_shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTempShop(
    @User("id") userId: string,
    @Param("temp_shop_id", new ParseUUIDPipe()) tempShopId: string,
  ): Promise<void> {
    await this.shopService.deleteTempShop(userId, tempShopId);
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
  ): Promise<IShopRecord> {
    return await this.shopService.getShop(shopId);
  }

  @Patch("/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async updateShop(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body(new ZodValidationPipe(UpdateShopSchema)) payload: UpdateShopDto,
  ): Promise<IShopRecord> {
    return await this.shopService.updateShop(userId, shopId, payload);
  }
}
