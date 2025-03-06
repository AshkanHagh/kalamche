import { Module } from "@nestjs/common";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { ServiceModule } from "./service/service.module";
import { ApiModule } from "./api/api.module";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [DrizzleModule, ConfigModule, ServiceModule, ApiModule],
})
export class AppModule {}
