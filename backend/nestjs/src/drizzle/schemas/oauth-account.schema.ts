import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const OAuthAccountTable = pgTable("oauth_accounts", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id),
    provider: table.varchar({ length: 50 }).notNull(),
    providerId: table.varchar({ length: 255 }).notNull(),
    createdAt,
    updatedAt,
  };
});

export type IOAuthAccount = typeof OAuthAccountTable.$inferSelect;
export type IOAuthAccountInsertForm = typeof OAuthAccountTable.$inferInsert;

export const OAuthAccountRelations = relations(
  OAuthAccountTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [OAuthAccountTable.userId],
      references: [UserTable.id],
    }),
  }),
);
