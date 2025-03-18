import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createPool } from "./connection";
import { drizzle } from "drizzle-orm/node-postgres";
import { seedDefaultPermissions } from "./seed/permissions.seed";
import * as schema from "./schema";

export const migration = async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const pool = createPool(process.env.DATABASE_URL!, 1);
  const connection = drizzle(pool, { casing: "snake_case", schema });

  await migrate(connection, {
    migrationsFolder: "src/drizzle/migrations",
  }).catch(console.log);

  await seedDefaultPermissions(connection);

  await pool.end();
};
