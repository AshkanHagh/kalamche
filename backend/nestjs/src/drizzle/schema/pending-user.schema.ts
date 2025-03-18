import { pgTable } from "drizzle-orm/pg-core";

export const PendingUserSchema = pgTable("pending_users", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  email: table.varchar({ length: 255 }).notNull(),
  passwordHash: table.varchar({ length: 300 }),
  token: table.varchar({ length: 300 }).notNull(),
  published: table.timestamp({ withTimezone: true }).defaultNow(),
}));
