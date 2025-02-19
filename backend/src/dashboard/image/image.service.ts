import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ImageProvider } from "../common/services/image/image.provider";
import { MinioProvider } from "../common/services/image/minio.provider";
import { CatchError } from "src/common/utils/error";
import { Image, UploadType } from "./types/image";
import { ImageRepository, InsertImageDto } from "./image.repository";
import * as sharp from "sharp";

@Injectable()
export class ImageService {
  constructor(
    @Inject(MinioProvider) private imageProvider: ImageProvider,
    private readonly repository: ImageRepository,
  ) {}

  private async resizeImage(
    buffer: Buffer,
    uploadType: UploadType,
  ): Promise<Buffer> {
    try {
      switch (uploadType) {
        case UploadType.Avatar: {
          return sharp(buffer)
            .resize(150, 150)
            .toFormat("jpeg")
            .jpeg({ quality: 80 })
            .toBuffer();
        }

        case UploadType.Product: {
          return sharp(buffer)
            .resize(500, 500)
            .toFormat("jpeg")
            .jpeg({ quality: 80 })
            .toBuffer();
        }

        default: {
          throw new HttpException(
            "Invalid upload type",
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async uploadImage(
    uploadType: UploadType,
    buffer: Buffer,
  ): Promise<Image> {
    try {
      const resizedImage = await this.resizeImage(buffer, uploadType);
      const imageResource = await this.imageProvider.upload(resizedImage);

      const insertImageDto: InsertImageDto = {
        url: imageResource.url,
        id: imageResource.id,
      };

      return await this.repository.insert(insertImageDto);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
