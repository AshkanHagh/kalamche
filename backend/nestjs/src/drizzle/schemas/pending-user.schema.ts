import { pgTable } from "drizzle-orm/pg-core";

export const PendingUserTable = pgTable("pending_users", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    email: table.varchar({ length: 255 }).notNull(),
    passwordHash: table.text().notNull(),
    token: table.text().notNull(),
    createdAt: table
      .timestamp()
      .notNull()
      .defaultNow()
      .$onUpdateFn(() => new Date()),
  };
});
