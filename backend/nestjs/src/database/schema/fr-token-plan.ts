import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { PaymentHistorySchema } from "./payment-history";

export const FrTokenPlanSchema = pgTable("fr_token_plans", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  name: table.varchar({ length: 255 }).notNull(),
  discription: table.varchar({ length: 500 }).notNull(),
  frTokens: table.integer().notNull(),
  price: table.bigint({ mode: "number" }).notNull(),
  pricePerFrToken: table.smallint().notNull(),
  createdAt: table.timestamp({ withTimezone: true }).notNull().defaultNow(),
}));

export const FrTokenPlanRelations = relations(
  FrTokenPlanSchema,
  ({ many }) => ({
    paymentHistory: many(PaymentHistorySchema),
  }),
);
