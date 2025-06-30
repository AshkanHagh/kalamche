import { Module } from "@nestjs/common";
import { ConfigsModule } from "./configs/configs.module";

@Module({
  imports: [ConfigsModule],
})
export class AppModule {}
