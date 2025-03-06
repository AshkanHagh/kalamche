import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { ConfigModule } from "src/config/config.module";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { TokenService } from "./services/token.service";
import { PermissionService } from "./services/permission.service";

@Module({
  imports: [ConfigModule, DrizzleModule],
  providers: [AuthService, TokenService, PermissionService],
  exports: [AuthService, TokenService, PermissionService],
})
export class ServiceModule {}
