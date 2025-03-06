import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { ServiceModule } from "src/service/service.module";
import { ConfigModule } from "src/config/config.module";

@Module({
  imports: [ServiceModule, ConfigModule],
  controllers: [AuthController],
})
export class ApiModule {}
