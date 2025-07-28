import { Module } from "@nestjs/common";
import { ShopService } from "./shop.service";
import { ShopController } from "./shop.controller";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { ProductModule } from "../product/product.module";
import { DrizzleModule } from "src/drizzle/drizzle.module";

@Module({
  imports: [AuthModule, RepositoryModule, ProductModule, DrizzleModule],
  providers: [ShopService],
  controllers: [ShopController],
})
export class ShopModule {}
