import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({})
export class ConfigsModule {
  static register(): Promise<DynamicModule> {
    return ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [],
    });
  }
}
