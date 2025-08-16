import { pgTable } from "drizzle-orm/pg-core";
import { id } from "./schema.helper";

export const PendingUserTable = pgTable("pending_users", (table) => {
  return {
    id,
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

export type IPendingUser = typeof PendingUserTable.$inferSelect;
export type IPendingUserInsertForm = typeof PendingUserTable.$inferInsert;
export type IPendingUserUpdateForm = Partial<IPendingUserInsertForm>;
