import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { ServiceModule } from "src/service/service.module";
import { ConfigModule } from "src/config/config.module";
import { RateLimitInterceptor } from "./interceptors/rate-limit.interceptor";

@Module({
  imports: [ServiceModule, ConfigModule],
  providers: [RateLimitInterceptor],
  controllers: [AuthController],
})
export class ApiModule {}
