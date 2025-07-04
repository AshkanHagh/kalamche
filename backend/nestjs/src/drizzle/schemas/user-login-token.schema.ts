import { pgTable } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const UserLoginTokenTable = pgTable("user_login_tokens", (table) => {
  return {
    userId: table
      .uuid()
      .primaryKey()
      .references(() => UserTable.id),
    token: table.text().notNull(),
    userAgent: table.text(),
    ip: table.varchar({ length: 60 }),
    createdAt: table
      .timestamp()
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  };
});

export const UserLoginTokenRelations = relations(
  UserLoginTokenTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserLoginTokenTable.userId],
      references: [UserTable.id],
    }),
  }),
);
