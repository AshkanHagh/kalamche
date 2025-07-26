import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const TransactionStatusEnum = pgEnum("transactions_status_enum", [
  "completed",
  "failed",
  "pending",
]);

export const TransactionTable = pgTable("transactions", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id),
    authority: table.text().notNull(),
    transactionId: table.text(),
    tokens: table.smallint().notNull(),
    price: table.real().notNull(),
    status: TransactionStatusEnum().notNull().default("pending"),
    createdAt,
    updatedAt,
  };
});

export type ITransaction = typeof TransactionTable.$inferSelect;
export type ITransactionInsertForm = typeof TransactionTable.$inferInsert;

export const TransactinRelations = relations(TransactionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TransactionTable.userId],
    references: [UserTable.id],
  }),
}));
