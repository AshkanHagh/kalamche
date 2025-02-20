import { Module } from "@nestjs/common";
import { StoreModule } from "./store/store.module";
import { ImageModule } from "./image/image.module";
import { ProductModule } from './product/product.module';

@Module({
  imports: [StoreModule, ImageModule, ProductModule],
  exports: [StoreModule, ImageModule],
})
export class DashboardModule {}
