import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";

@Module({
  imports: [ConfigModule.forRoot({}), DatabaseModule, CoreModule],
})
export class AppModule {}
