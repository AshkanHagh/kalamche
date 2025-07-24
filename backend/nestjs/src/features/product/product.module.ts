import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { ProductScheduler } from "./scheduler";
import { S3Service } from "./services/s3.service";
import { ProductUtilService } from "./util.service";
import { DrizzleModule } from "src/drizzle/drizzle.module";

@Module({
  imports: [AuthModule, RepositoryModule, DrizzleModule],
  controllers: [ProductController],
  providers: [ProductService, ProductScheduler, S3Service, ProductUtilService],
  exports: [S3Service],
})
export class ProductModule {}
