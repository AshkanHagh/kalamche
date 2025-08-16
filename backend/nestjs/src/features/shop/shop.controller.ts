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
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { ShopService } from "./shop.service";
import { User } from "../auth/decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  ResourceType,
  SHOP_RESOURCE_ACTION,
} from "src/constants/global.constant";
import { PermissionGuard } from "../auth/guards/permission.guard";
import {
  GetProductDto,
  PaginationDto,
  UpdateShopCreationDto,
  UpdateShopDto,
  UploadImageDto,
} from "./dto";
import { IShopController } from "./interfaces/IController";
import {
  IProductRecord,
  IShop,
  IShopRecord,
  ITempShop,
} from "src/drizzle/schemas";
import { ApiParams, ApiQuery } from "src/utils/swagger-decorator";

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

  @ApiParams({ type: UploadImageDto })
  @Post("/images/:shopId/:isTempShop")
  @UseInterceptors(FileInterceptor("image"))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async uploadImage(
    @User("id") userId: string,
    @Param() params: UploadImageDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    image: Express.Multer.File,
  ): Promise<void> {
    await this.shopService.uploadImage(userId, params, image.buffer);
    return;
  }

  @Patch("/complete/:temp_shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async completeShopCreation(
    @User("id") userId: string,
    @Param("temp_shop_id", new ParseUUIDPipe()) tempShopId: string,
    @Body() payload: UpdateShopCreationDto,
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

  @Patch("/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.UPDATE)
  async updateShop(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Body() payload: UpdateShopDto,
  ): Promise<IShopRecord> {
    return await this.shopService.updateShop(userId, shopId, payload);
  }

  @ApiQuery({ type: PaginationDto })
  @Get("/products/:shop_id")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getProducts(
    @User("id") userId: string,
    @Param("shop_id", new ParseUUIDPipe()) shopId: string,
    @Query() params: PaginationDto,
  ): Promise<IProductRecord[]> {
    return await this.shopService.getProducts(userId, shopId, params);
  }

  @Get("/")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getMyShop(@User("id") userId: string): Promise<IShop> {
    return await this.shopService.getMyShop(userId);
  }

  @ApiParams({ type: GetProductDto })
  @Get("/products/:shopId/:productId")
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.READ)
  async getProduct(@User("id") userId: string, @Param() params: GetProductDto) {
    return await this.shopService.getProduct(userId, params);
  }
}
