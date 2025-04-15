import { migrate } from "drizzle-orm/node-postgres/migrator";
import { createDatabaseConnection, DatabaseOptions } from "./connection";
import { seedDefaultPermissions } from "./seed/permissions.seed";

export const migration = async (options: DatabaseOptions) => {
  const connection = createDatabaseConnection(options);

  await migrate(connection, {
    migrationsFolder: "src/drizzle/migrations",
  }).catch(console.log);

  await seedDefaultPermissions(connection);
};
