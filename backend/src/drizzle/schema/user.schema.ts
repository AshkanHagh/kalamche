import { index, pgTable } from "drizzle-orm/pg-core";

export const UserSchema = pgTable(
  "users",
  (table) => ({
    id: table.uuid().primaryKey().defaultRandom(),
    name: table.varchar({ length: 255 }).notNull(),
    email: table.varchar({ length: 255 }).notNull().unique(),
    refreshTokenHash: table.varchar({ length: 300 }),
    createdAt: table.timestamp().defaultNow().notNull(),
    updatedAt: table
      .timestamp()
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  }),
  (table) => ({
    idxUserEmail: index("idx_user_email").on(table.email),
  }),
);
