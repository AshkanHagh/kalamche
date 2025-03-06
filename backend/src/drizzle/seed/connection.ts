import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";

export function seedConnection() {
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
}
