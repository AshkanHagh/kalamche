import { Module } from "@nestjs/common";
import { StoreController } from "./store.controller";
import { StoreService } from "./store.service";
import { MinioProvider } from "../common/services/image/minio.provider";
import { ConfigModule } from "@nestjs/config";
import { StoreRepository } from "./store.repository";
import { DatabaseModule } from "src/database/database.module";
import { AuthModule } from "src/core/auth/auth.module";

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule],
  controllers: [StoreController],
  providers: [StoreService, MinioProvider, StoreRepository],
  exports: [StoreService],
})
export class StoreModule {}
