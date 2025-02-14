import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { DATABASE_CONNECTION } from ".";
import * as Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schemas";

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db_url = config.get<string>("DATABASE_URL")!;

        const sqliteClient = new Database(db_url);
        return drizzle({
          client: sqliteClient,
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
