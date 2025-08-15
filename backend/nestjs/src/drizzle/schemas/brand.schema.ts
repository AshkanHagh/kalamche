import { pgTable } from "drizzle-orm/pg-core";
import { id } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ProductTable } from "./product.schema";

export const BrandTable = pgTable("brands", (table) => {
  return {
    id,
    name: table.varchar({ length: 120 }).notNull(),
    slug: table.varchar({ length: 120 }).notNull(),
  };
});

export type IBrand = typeof BrandTable.$inferSelect;
export type IBrandInsertForm = typeof BrandTable.$inferInsert;

export const BrandRelations = relations(BrandTable, ({ many }) => ({
  products: many(ProductTable),
}));
