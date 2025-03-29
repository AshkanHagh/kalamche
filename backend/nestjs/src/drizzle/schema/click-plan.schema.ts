import { pgTable } from "drizzle-orm/pg-core";

export const ClickPlanSchema = pgTable("click_plans", (table) => {
  return {
    id: table.bigserial({ mode: "number" }).primaryKey(),
    name: table.varchar({ length: 255 }).notNull(),
    description: table.varchar({ length: 500 }).notNull(),
    clicks: table.integer().notNull(),
    price: table.bigint({ mode: "number" }).notNull(),
    pricePerClick: table.smallint().notNull(),
    createdAt: table.timestamp({ withTimezone: true }).defaultNow(),
  };
});
