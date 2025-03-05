import { Module } from "@nestjs/common";
import { CoreModule } from "./core/core.module";
import { FeaturesModule } from "./features/features.module";
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from './drizzle/drizzle.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CoreModule,
    FeaturesModule,
    DrizzleModule,
  ],
})
export class AppModule {}
