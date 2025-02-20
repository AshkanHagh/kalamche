import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ImageService } from "./image.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadType } from "./types/image";
import { AuthorizationGuard } from "../guards/authorization";

@Controller("image")
@UseGuards(AuthorizationGuard)
export class ImageController {
  constructor(private readonly service: ImageService) {}

  @Post("/")
  @UseInterceptors(FileInterceptor("image"))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query("type") uploadType: UploadType,
  ) {
    return await this.service.uploadImage(uploadType, file.buffer);
  }
}
