import { Global, Module } from "@nestjs/common";
import { DATABASE } from "./constants";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { DrizzleService } from "./drizzle.service";

@Global()
@Module({
  providers: [
    DrizzleService,
    {
      provide: DATABASE,
      inject: [DrizzleService],
      useFactory: (drizzleService: DrizzleService) => {
        return drizzle(drizzleService.pool, { schema, casing: "snake_case" });
      },
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
