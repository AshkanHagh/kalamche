import { Test, TestingModule } from "@nestjs/testing";
import { drizzle } from "drizzle-orm/node-postgres";
import { AppModule } from "src/app.module";
import * as schema from "../src/drizzle/schemas";
import { sql } from "drizzle-orm";
import { RepositoryService } from "src/repository/repository.service";
import { Database, IUser, IUserInsertForm } from "src/drizzle/types";
import * as argon2 from "argon2";
import { Pool } from "pg";
import { USER_ROLE } from "src/constants/global.constant";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { MinioContainer } from "@testcontainers/minio";

export async function createNestAppInstance(): Promise<TestingModule> {
  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  return module;
}

export async function createTestPostgresDb() {
  const container = await new PostgreSqlContainer(
    "registry.docker.ir/pgvector/pgvector:0.8.0-pg17",
  ).start();
  process.env.DATABASE_URL = container.getConnectionUri();

  return container;
}

export async function createTestMinio() {
  const container = await new MinioContainer(
    "registry.docker.ir/minio/minio:latest",
  ).start();
  console.log(`http://${container.getHost()}:${container.getPort()}`);

  process.env.AWS_S3_ACCESS_KEY = "minioadmin";
  process.env.AWS_S3_SECRET_KEY = "minioadmin";
  process.env.AWS_S3_BUCKET_NAME = "kalamche";
  process.env.AWS_S3_ENDPOINT = `http://${container.getHost()}:${container.getPort()}`;
  process.env.AWS_S3_REGION = " ";
  process.env.AWS_S3_USE_PATH_STYLE = "true";

  return container;
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
        roles: [USER_ROLE.USER],
      });
    } else {
      const hashedPass = await argon2.hash(form?.passwordHash || "pwd");
      user = await repo.user().insert({
        email: form?.email || "john@example.com",
        name: form?.name || "john",
        passwordHash: hashedPass,
        roles: [USER_ROLE.USER],
      });
    }
  } else {
    user = existingUser;
  }

  await repo.userLoginToken().insertOrUpdate({
    token: "",
    userId: user.id,
  });

  return user;
}

export async function stopDb(db: Database) {
  await db.$client?.end();
  // TODO: find a way to remove timeout for drizzle to close conns
  await new Promise((resolve) => setTimeout(resolve, 10_000));
}
