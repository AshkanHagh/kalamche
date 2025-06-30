import { pgTable } from "drizzle-orm/pg-core";

export const PermissionTable = pgTable("permissions", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    name: table.varchar({ length: 50 }).notNull(),
    resource: table.varchar({ length: 50 }).notNull(),
    action: table.varchar({ length: 50 }).notNull(),
  };
});
