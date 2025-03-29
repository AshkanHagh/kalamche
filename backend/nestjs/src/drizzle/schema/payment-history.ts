import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { ClickPlanSchema } from "./click-plan.schema";
import { UserSchema } from "./user.schema";
import { relations } from "drizzle-orm";

export const PaymentStatusEnum = pgEnum("payment_status_enum", [
  "COMPLETED",
  "PENDING",
  "FAILED",
]);

export const PaymentHistorySchema = pgTable(
  "payment_histories",
  (table) => {
    return {
      id: table.bigserial({ mode: "number" }).primaryKey(),
      clickId: table
        .bigserial({ mode: "number" })
        .references(() => ClickPlanSchema.id),
      userId: table
        .bigserial({ mode: "number" })
        .references(() => UserSchema.id),
      amount: table.bigint({ mode: "number" }).notNull(),
      clicks: table.integer().notNull(),
      status: PaymentStatusEnum().notNull().default("PENDING"),
      transaction_id: table.varchar({ length: 100 }).notNull(),
      createdAt: table.timestamp({ withTimezone: true }).defaultNow(),
    };
  },
  (table) => [
    index("payment_histories_click_id_idx").on(table.clickId),
    index("payment_histories_user_id_idx").on(table.userId),
    index("payment_histories_transaction_id_idx").on(table.transaction_id),
  ],
);

export const PaymentHistoryRelations = relations(
  PaymentHistorySchema,
  ({ one }) => ({
    user: one(UserSchema, {
      fields: [PaymentHistorySchema.userId],
      references: [UserSchema.id],
      relationName: "user_payment_history",
    }),
    click: one(ClickPlanSchema, {
      fields: [PaymentHistorySchema.clickId],
      references: [ClickPlanSchema.id],
    }),
  }),
);
