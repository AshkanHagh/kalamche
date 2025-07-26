import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const WalletTable = pgTable("wallets", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id),
    tokens: table.smallint().notNull(),
    createdAt,
    updatedAt,
  };
});

export const WalletRelations = relations(WalletTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [WalletTable.userId],
    references: [UserTable.id],
  }),
}));
