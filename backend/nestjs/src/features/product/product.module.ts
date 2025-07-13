import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { ProductScheduler } from "./scheduler";

@Module({
  imports: [AuthModule, RepositoryModule],
  controllers: [ProductController],
  providers: [ProductService, ProductScheduler],
})
export class ProductModule {}
