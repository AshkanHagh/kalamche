import {
  Controller,
  HttpCode,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import { Permission } from "../auth/decorators/permission.decorators";
import {
  PRODUCT_RESOURCE_ACTION,
  ResourceType,
  SHOP_RESOURCE_ACTION,
} from "src/constants/global.constant";
import { User } from "../auth/decorators/user.decorator";
import { MAX_IMAGE_SIZE, MAX_PRODUCT_IMAGE_COUNT } from "./constants";
import { AuthorizationGuard } from "../auth/guards/authorization.guard";
import { PermissionGuard } from "../auth/guards/permission.guard";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";

@Controller("attachments")
@UseGuards(AuthorizationGuard, PermissionGuard, RateLimitGuard)
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post("shops")
  @UseInterceptors(FileInterceptor("image"))
  @Permission(ResourceType.SHOP, SHOP_RESOURCE_ACTION.CREATE)
  async uploadImage(
    @User("id") userId: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024,
        })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    image: Express.Multer.File,
  ) {
    return await this.attachmentService.anonymouseShopImage(
      userId,
      image.buffer,
    );
  }

  @Post("products")
  @Permission(ResourceType.PRODUCT, PRODUCT_RESOURCE_ACTION.CREATE)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        {
          name: "thumbnailImage",
          maxCount: 1,
        },
        {
          name: "images",
          maxCount: 5,
        },
      ],
      {
        limits: {
          fileSize: MAX_IMAGE_SIZE,
          fieldSize: MAX_IMAGE_SIZE * MAX_PRODUCT_IMAGE_COUNT,
        },
      },
    ),
  )
  async uploadImages(
    @User("id") userId: string,
    @UploadedFiles()
    files: {
      thumbnailImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    return await this.attachmentService.anonymouseProductImages(userId, {
      thumbnailImage: files.thumbnailImage
        ? files.thumbnailImage[0].buffer
        : undefined,
      images: files.images?.map((f) => f.buffer) || [],
    });
  }
}
