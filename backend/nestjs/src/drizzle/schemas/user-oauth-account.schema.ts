import { pgTable } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const UserOAuthAccountTable = pgTable("user_oauth_accounts", (table) => {
  return {
    oauthId: table.text().notNull(),
    userId: table
      .uuid()
      .primaryKey()
      .references(() => UserTable.id),
  };
});

export const UserOAuthAccountRelations = relations(
  UserOAuthAccountTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [UserOAuthAccountTable.userId],
      references: [UserTable.id],
    }),
  }),
);
