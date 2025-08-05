import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { getTableName, sql } from "drizzle-orm";
import { Database } from "src/drizzle/types";

export async function createNestAppInstance(): Promise<TestingModule> {
  process.env.NODE_ENV = "test";

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return module;
}

export async function truncateTables(db: Database, ...tables: any[]) {
  await db.transaction(async (tx) => {
    const queries = tables.map((table) => {
      // eslint-disable-next-line
      const tableName = getTableName(table);
      return sql.raw(`TRUNCATE ${tableName} CASCADE`);
    });

    await Promise.all(queries.map((q) => tx.execute(q)));
  });

  // await db.$client?.end();
}
