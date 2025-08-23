import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { PAYMENT_METHODS } from "../constants";

export const TransactionStatusEnum = pgEnum("transactions_status_enum", [
  "completed",
  "failed",
  "pending",
]);
export const TransactionPaymentMethodEnum = pgEnum(
  "transactions_payment_method_enum",
  PAYMENT_METHODS,
);

export const TransactionTable = pgTable("transactions", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id),
    referenceId: table.text(),
    transactionId: table.text(),
    tokens: table.smallint().notNull(),
    price: table.real().notNull(),
    method: TransactionPaymentMethodEnum().notNull(),
    status: TransactionStatusEnum().notNull().default("pending"),
    error: table.text(),
    createdAt,
    updatedAt,
  };
});

export type ITransaction = typeof TransactionTable.$inferSelect;
export type ITransactionInsertForm = typeof TransactionTable.$inferInsert;
export type ITransactionUpdateForm = Partial<ITransactionInsertForm>;
export type ITransactionRecord = Omit<
  ITransactionInsertForm,
  "error" | "updatedAt"
>;

export const TransactinRelations = relations(TransactionTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TransactionTable.userId],
    references: [UserTable.id],
  }),
}));
