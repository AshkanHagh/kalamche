import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ImageService } from "./image.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadType } from "./types/image";

@Controller("image")
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
