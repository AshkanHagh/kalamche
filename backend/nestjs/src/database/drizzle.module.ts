import { DynamicModule, Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./constants";
import { createDatabaseConnection, createMockDb } from "./connection";
import { ConfigService } from "src/config/config.service";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configs: ConfigService) => {
        return createDatabaseConnection(configs.dbOptions);
      },
    },
  ],

  exports: [DATABASE_CONNECTION],
})
export class DrizzleModule {
  static forTest(): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DATABASE_CONNECTION,
          useFactory: () => {
            return createMockDb();
          },
        },
      ],
      exports: [DATABASE_CONNECTION],
    };
  }
}
