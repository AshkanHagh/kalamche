import { Module } from "@nestjs/common";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { ProductRepository } from "./product.repository";
import { StoreModule } from "../store/store.module";
import { DatabaseModule } from "src/database/database.module";
import { AuthModule } from "src/core/auth/auth.module";

@Module({
  imports: [StoreModule, DatabaseModule, AuthModule],
  providers: [ProductService, ProductRepository],
  controllers: [ProductController],
})
export class ProductModule {}
