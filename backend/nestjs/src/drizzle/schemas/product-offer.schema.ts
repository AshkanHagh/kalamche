import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { ShopTable } from "./shop.schema";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";

// TODO: remove price and add final_price
export const ProductOfferTable = pgTable("product_offers", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .notNull()
      .references(() => ShopTable.id, { onDelete: "cascade" }),
    productId: table
      .uuid()
      .notNull()
      .references(() => ProductTable.id),
    price: table.real().notNull(),
    createdAt,
    updatedAt,
  };
});

export const ProductVendorRelations = relations(
  ProductOfferTable,
  ({ one }) => ({
    shop: one(ShopTable, {
      fields: [ProductOfferTable.shopId],
      references: [ShopTable.id],
    }),
    product: one(ProductTable, {
      fields: [ProductOfferTable.productId],
      references: [ProductTable.id],
    }),
  }),
);
