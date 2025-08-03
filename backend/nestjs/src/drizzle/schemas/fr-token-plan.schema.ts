import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";

// NOTE: this will change in strucher for front
export const FrTokenPlanTable = pgTable("fr_token_plans", (table) => {
  return {
    id,
    name: table.varchar({ length: 255 }).notNull(),
    description: table.text().notNull(),
    tokens: table.smallint().notNull(),
    totalPrice: table.real().notNull(),
    pricePerToken: table.real().notNull(),
    createdAt,
    updatedAt,
  };
});

export type IFrTokenPlan = typeof FrTokenPlanTable.$inferSelect;
export type IFrTokenPlanInsertForm = typeof FrTokenPlanTable.$inferInsert;
