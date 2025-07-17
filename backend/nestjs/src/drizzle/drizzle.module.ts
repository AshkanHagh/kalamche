import { Module } from "@nestjs/common";
import { DATABASE } from "./constants";
import { ConfigService } from "@nestjs/config";
import { DB_CONFIG } from "src/config/constants";
import { IDbConfig } from "src/config/db.config";
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
          max: 10,
          ssl: config?.postgres.ssl,
          allowExitOnIdle: false,
        });

        return drizzle(pool, { schema, casing: "snake_case", logger: false });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
