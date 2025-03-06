import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const migration = async () => {
  try {
    console.log("INFO: start migration");
    await new Promise((resolve) => setTimeout(resolve, 15000));
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
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
