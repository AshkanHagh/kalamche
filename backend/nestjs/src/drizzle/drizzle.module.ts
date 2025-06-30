import { Module } from "@nestjs/common";
import { DATABASE } from "./constants";
import { ConfigService } from "@nestjs/config";
import { DB_CONFIG } from "src/configs/constants";
import { IDbConfig } from "src/configs/db.config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";

@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<IDbConfig>(DB_CONFIG);

        const pool = new Pool({
          connectionString: config?.postgres.url,
          max: 100,
          min: 1,
          ssl: config?.postgres.ssl,
        });

        return drizzle(pool, { schema, casing: "snake_case", logger: true });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
