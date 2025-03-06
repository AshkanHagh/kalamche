import { Module } from "@nestjs/common";
import { DATABASE_CONNECTION } from ".";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        const url: string = process.env.DATABASE_URL!;
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
