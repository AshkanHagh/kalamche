import { Module } from "@nestjs/common";
import { ConfigsModule } from "./configs/configs.module";
import { DrizzleModule } from "./drizzle/drizzle.module";

@Module({
  imports: [ConfigsModule.register(), DrizzleModule],
})
export class AppModule {}
