import { DynamicModule, Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from "./constants";
import { createMockDb, createPool } from "./connection";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { ConfigService } from "src/config/config.service";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (config: ConfigService) => {
        const pool = createPool(process.env.DATABASE_URL!, 100);
        return drizzle(pool, {
          casing: "snake_case",
          schema,
        });
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
