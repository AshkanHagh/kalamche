import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./product.repository";
import { StoreModule } from "../store/store.module";
import { DatabaseModule } from "src/database/database.module";
import { AuthModule } from "src/core/auth/auth.module";
import { MinioProvider } from "../common/services/image/minio.provider";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [StoreModule, DatabaseModule, AuthModule, ConfigModule],
  providers: [ProductService, ProductRepository, MinioProvider],
  controllers: [ProductController],
})
export class ProductModule {}
