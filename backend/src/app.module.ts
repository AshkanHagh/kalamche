import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { CoreModule } from "./core/core.module";
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [ConfigModule.forRoot({}), DatabaseModule, CoreModule, DashboardModule],
})
export class AppModule {}
