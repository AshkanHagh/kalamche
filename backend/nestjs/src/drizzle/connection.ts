import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";

export function createMockDb() {
  return drizzle.mock({ schema });
}

export function createPool(url: string, max: number) {
  const pool = new Pool({
    connectionString: url,
    max,
  });

  return pool;
}
