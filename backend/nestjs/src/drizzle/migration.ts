import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createPool } from ".";
import { drizzle } from "drizzle-orm/node-postgres";

export const migration = async () => {
  // await new Promise((resolve) => setTimeout(resolve, 200));
  const migrationPool = createPool();

  await migrate(drizzle(migrationPool), {
    migrationsFolder: "src/drizzle/migrations",
  }).catch(console.log);

  await migrationPool.end();
};
