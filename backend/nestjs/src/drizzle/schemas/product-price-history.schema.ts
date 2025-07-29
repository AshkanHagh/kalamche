import { pgTable } from "drizzle-orm/pg-core";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";
import { createdAt, id } from "./schema.helper";

export const ProductPriceHistoryTable = pgTable(
  "product_price_history",
  (table) => {
    return {
      id,
      productId: table
        .uuid()
        .notNull()
        .references(() => ProductTable.id),
      price: table.real().notNull(),
      createdAt,
    };
  },
);

export type IProductPriceHistory = typeof ProductPriceHistoryTable.$inferSelect;
export type IProductPriceHistoryInsertForm =
  typeof ProductPriceHistoryTable.$inferInsert;

export const ProductPriceHistoryRelations = relations(
  ProductPriceHistoryTable,
  ({ one }) => ({
    product: one(ProductTable, {
      fields: [ProductPriceHistoryTable.productId],
      references: [ProductTable.id],
    }),
  }),
);
