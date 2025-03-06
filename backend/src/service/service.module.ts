import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { ConfigModule } from "src/config/config.module";
import { DrizzleModule } from "src/drizzle/drizzle.module";

@Module({
  imports: [ConfigModule, DrizzleModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class ServiceModule {}
