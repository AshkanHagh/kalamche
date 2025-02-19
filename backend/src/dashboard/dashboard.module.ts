import { Module } from "@nestjs/common";
import { StoreModule } from "./store/store.module";
import { ImageModule } from './image/image.module';

@Module({
  imports: [StoreModule, ImageModule],
  exports: [StoreModule],
})
export class DashboardModule {}
