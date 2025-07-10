import { pgTable } from "drizzle-orm/pg-core";
import { id } from "./schema.helper";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";

export const ProductImageTable = pgTable("product_images", (table) => {
  return {
    id,
    productId: table
      .uuid()
      .notNull()
      .references(() => ProductTable.id),
    url: table.text().notNull(),
    primary: table.boolean().notNull(),
  };
});

export const ProductImageRelations = relations(
  ProductImageTable,
  ({ one }) => ({
    product: one(ProductTable, {
      fields: [ProductImageTable.productId],
      references: [ProductTable.id],
    }),
  }),
);
