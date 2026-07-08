import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { PAYMENT_METHODS } from "src/constants/global.constant";

export const TrxStatus = pgEnum("trx_status_enum", [
  "completed",
  "failed",
  "pending",
]);
export const TrxPaymentMethods = pgEnum("trx_payment_methods", PAYMENT_METHODS);

// in production mostly you dont delete tx after user deleation but...
export const TransactionTable = pgTable("transactions", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    transactionId: table.text(),
    tokens: table.smallint().notNull(),
    price: table.real().notNull(),
    method: TrxPaymentMethods().notNull(),
    status: TrxStatus().notNull().default("pending"),
    error: table.text(),
    createdAt,
    updatedAt,
  };
});

export type Transaction = typeof TransactionTable.$inferSelect;
export type TransactionInsertForm = typeof TransactionTable.$inferInsert;

export const TransactinRelations = relations(TransactionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TransactionTable.userId],
    references: [UserTable.id],
  }),
}));
