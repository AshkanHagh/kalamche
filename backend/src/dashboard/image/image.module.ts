import { Module } from "@nestjs/common";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";
import { DatabaseModule } from "src/database/database.module";
import { ImageRepository } from "./image.repository";
import { MinioProvider } from "../common/services/image/minio.provider";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "src/core/auth/auth.module";

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, MinioProvider],
})
export class ImageModule {}
