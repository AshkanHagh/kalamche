import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { Pool } from "pg";

export interface DatabaseOptions {
  connection: string;
  maxPool: number;
}

export function createDatabaseConnection(options: DatabaseOptions) {
  const pool = new Pool({
    connectionString: options.connection,
    max: options.maxPool,
  });

  return drizzle(pool, { schema, casing: "snake_case" });
}

export function createMockDb() {
  return drizzle.mock({ schema });
}
