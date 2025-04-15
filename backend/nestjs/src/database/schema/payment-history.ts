import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { FrTokenPlanSchema } from "./fr-token-plan";
import { UserSchema } from "./user";
import { relations } from "drizzle-orm";

export const PaymentStatusEnum = pgEnum("payment_status", [
  "completed",
  "pending",
  "faild",
]);

export const PaymentHistorySchema = pgTable("payment_histories", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  frTokenId: table
    .uuid()
    .references(() => FrTokenPlanSchema.id)
    .notNull(),
  userId: table
    .uuid()
    .references(() => UserSchema.id)
    .notNull(),
  price: table.bigint({ mode: "number" }).notNull(),
  frTokens: table.integer().notNull(),
  status: PaymentStatusEnum().notNull(),
  transactionId: table.varchar({ length: 100 }).notNull(),
  sessionId: table.varchar({ length: 100 }).notNull(),
  createdAt: table.timestamp({ withTimezone: true }).defaultNow(),
}));

export const PaymentHistoryRelations = relations(
  PaymentHistorySchema,
  ({ one }) => ({
    frTokenPlan: one(FrTokenPlanSchema, {
      fields: [PaymentHistorySchema.frTokens],
      references: [FrTokenPlanSchema.id],
    }),
    user: one(UserSchema, {
      fields: [PaymentHistorySchema.userId],
      references: [UserSchema.id],
    }),
  }),
);
