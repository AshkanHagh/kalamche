import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { ShopTable } from "./shop.schema";
import { relations } from "drizzle-orm";

export const TempProductTable = pgTable("temp_products", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .notNull()
      .references(() => ShopTable.id),
    upc: table.varchar({ length: 13 }).notNull(),
    modelNumber: table.varchar({ length: 50 }).notNull(),
    createdAt,
  };
});

export const TempProductRelations = relations(TempProductTable, ({ one }) => ({
  shop: one(ShopTable, {
    fields: [TempProductTable.shopId],
    references: [ShopTable.id],
  }),
}));

export type ITempProduct = typeof TempProductTable.$inferSelect;
export type ITempProductInsertForm = typeof TempProductTable.$inferInsert;
