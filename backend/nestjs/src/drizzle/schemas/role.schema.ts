import { pgTable } from "drizzle-orm/pg-core";

export const RoleTable = pgTable("roles", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    name: table.varchar({ length: 50 }).notNull(),
    description: table.text().notNull(),
  };
});
