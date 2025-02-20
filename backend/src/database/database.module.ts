import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DATABASE_CONNECTION } from ".";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { Pool } from "pg";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db_url = config.get<string>("DATABASE_URL")!;

        const pool = new Pool({
          connectionString: db_url,
          min: 10,
          max: 100,
          connectionTimeoutMillis: 1000 * 8,
          idleTimeoutMillis: 1000 * 8,
          maxLifetimeSeconds: 8,
        });

        return drizzle({
          client: pool,
          schema,
          logger: true,
          casing: "snake_case",
        });
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
