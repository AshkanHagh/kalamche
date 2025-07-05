import { Test, TestingModule } from "@nestjs/testing";
import { drizzle } from "drizzle-orm/node-postgres";
import { AppModule } from "src/app.module";
import * as schema from "../src/drizzle/schemas";
import { sql } from "drizzle-orm";
import { RepositoryService } from "src/repository/repository.service";
import { IUser, IUserInsertForm } from "src/drizzle/types";
import * as argon2 from "argon2";
import { Pool } from "pg";

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

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  });
  const db = drizzle(pool, { schema });

  const tableNames = db._.schema!;
  const queries = Object.values(tableNames).map((table) => {
    return sql.raw(`TRUNCATE ${table.dbName} CASCADE`);
  });
  await db.transaction(async (tx) => {
    await Promise.all(queries.map((q) => tx.execute(q)));
  });

  await pool.end();
}

export async function createUser(
  nestModule: TestingModule,
  oauthUser?: boolean,
  form?: Partial<IUserInsertForm>,
  existingUser?: IUser,
) {
  const repo = nestModule.get(RepositoryService);

  let user: IUser;
  if (!existingUser) {
    if (oauthUser) {
      user = await repo.user().insert({
        email: form?.email || "jane@example.com",
        name: form?.name || "john",
      });
    } else {
      const hashedPass = await argon2.hash(form?.passwordHash || "pwd");
      user = await repo.user().insert({
        email: form?.email || "john@example.com",
        name: form?.name || "john",
        passwordHash: hashedPass,
      });
    }
  } else {
    user = existingUser;
  }

  await repo.userLoginToken().insertOrUpdate({
    token: "",
    userId: user.id,
  });
}
