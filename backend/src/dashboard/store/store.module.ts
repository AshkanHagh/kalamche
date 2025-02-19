import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { MinioProvider } from "../common/services/image/minio.provider";
import { ConfigModule } from "@nestjs/config";
import { StoreRepository } from "./store.repository";
import { DatabaseModule } from "src/database/database.module";
import { AuthorizationMiddleware } from "../middlewares/authorization";
import { AuthModule } from "src/core/auth/auth.module";

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
  controllers: [StoreController],
  providers: [StoreService, MinioProvider, StoreRepository],
})
export class StoreModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthorizationMiddleware).forRoutes({
      path: "store",
      method: RequestMethod.POST,
    });
  }
}
