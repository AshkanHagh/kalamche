import { Test, TestingModule } from "@nestjs/testing";
import { drizzle } from "drizzle-orm/node-postgres";
import { AppModule } from "src/app.module";
import * as schema from "../src/drizzle/schemas";
import { sql } from "drizzle-orm";

export async function createNestAppInstance(): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return module;
}

export async function clearDb() {
  if (process.env.NODE_ENV !== "test") {
    return;
  }

  const db = drizzle(process.env.DATABASE_URL!, { schema });

  const tableNames = db._.schema!;
  const queries = Object.values(tableNames).map((table) => {
    return sql.raw(`TRUNCATE ${table.dbName} CASCADE`);
  });

  await db.transaction(async (tx) => {
    await Promise.all(queries.map((q) => tx.execute(q)));
  });
}
