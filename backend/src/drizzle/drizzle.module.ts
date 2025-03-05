import { Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from ".";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url: string = config.getOrThrow("DATABASE_URL");
        const pool = new Pool({
          connectionString: url,
          max: 100,
          min: 1,
        });

        return drizzle(pool, {
          schema,
          casing: "snake_case",
          logger: true,
        });
      },
    },
  ],

  exports: [DATABASE_CONNECTION],
})
export class DrizzleModule {}
