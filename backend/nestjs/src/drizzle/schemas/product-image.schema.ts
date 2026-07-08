import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";

export const ImageStatusEnum = pgEnum("image_status", ["published", "draft"]);

export const ProductImageTable = pgTable("product_images", (table) => {
  return {
    id,
    productId: table
      .uuid()
      .notNull()
      .references(() => ProductTable.id, { onDelete: "cascade" }),
    isThumbnail: table.boolean().notNull(),
    status: ImageStatusEnum().notNull().default("draft"),
    url: table.text().notNull(),
    createdAt,
  };
});

export type ProductImage = typeof ProductImageTable.$inferSelect;
export type ProductImageInsertForm = typeof ProductImageTable.$inferInsert;

export const ProductImageRelations = relations(
  ProductImageTable,
  ({ one }) => ({
    product: one(ProductTable, {
      fields: [ProductImageTable.productId],
      references: [ProductTable.id],
    }),
  }),
);
