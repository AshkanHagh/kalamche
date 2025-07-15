import {
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { IShopController } from "./interfaces/controller";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { IShop } from "src/drizzle/types";
import { ShopService } from "./shop.service";
import { User } from "../auth/decorators/user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("shops")
@UseGuards(AuthorizationGuard)
export class ShopController implements IShopController {
  constructor(private shopService: ShopService) {}

  @Post("/")
  async createShop(@User("id") userId: string): Promise<IShop> {
    const result = this.shopService.createShop(userId);
    return result;
  }

  @Post("/image/upload/:shop_id")
  @UseInterceptors(FileInterceptor("image"))
  @HttpCode(HttpStatus.NO_CONTENT)
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
}
