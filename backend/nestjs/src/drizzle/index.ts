import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

export const DATABASE_CONNECTION: string = "DATABASE_CONNECTION";

export function createPool(connection?: string) {
  const url: string =
    process.env.DATABASE_URL ||
    connection ||
    "postgresql://test:password@localhost:7302/kalamche_test";

  const pool = new Pool({
    connectionString: url,
    max: 100,
    min: 1,
  });

  return drizzle(pool, {
    schema,
    casing: "snake_case",
  });
}
