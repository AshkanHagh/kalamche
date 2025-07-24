import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";
import { TempProductTable } from "./temp-product.schema";

export const ImageStatusEnum = pgEnum("image_status", ["published", "draft"]);

export const ProductImageTable = pgTable("product_images", (table) => {
  return {
    id,
    productId: table.uuid().references(() => ProductTable.id),
    tempProductId: table.uuid().references(() => TempProductTable.id),
    isThumbnail: table.boolean().notNull(),
    isCompleted: table.boolean().notNull(),
    status: ImageStatusEnum().notNull().default("draft"),
    url: table.text(),
    createdAt,
  };
});

export type IProductImage = typeof ProductImageTable.$inferSelect;
export type IProductImageInsertForm = typeof ProductImageTable.$inferInsert;
export type IProductImageUpdateForm = Partial<IProductImageInsertForm>;

export const ProductImageRelations = relations(
  ProductImageTable,
  ({ one }) => ({
    product: one(ProductTable, {
      fields: [ProductImageTable.productId],
      references: [ProductTable.id],
    }),
    tempProduct: one(TempProductTable, {
      fields: [ProductImageTable.tempProductId],
      references: [TempProductTable.id],
    }),
  }),
);
