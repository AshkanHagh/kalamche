import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const migration = async () => {
  try {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const pool = new Pool({
      connectionString:
        process.env.DATABASE_URL ??
        "postgresql://test:password@localhost:7302/kalamche_test",
      max: 1,
    });

    await migrate(drizzle(pool), {
      migrationsFolder: "src/drizzle/migrations",
    });
    await pool.end();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`ERROR: could not migrate: ${error.message}`);
    }
  }
};
