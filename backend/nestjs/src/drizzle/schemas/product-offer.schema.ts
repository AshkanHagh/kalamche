import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { IShop, ShopTable } from "./shop.schema";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";

export const ProductOfferStatusEnum = pgEnum("product_offer_status", [
  "active",
  "inactive",
]);

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
    title: table.text().notNull(),
    finalPrice: table.real().notNull(),
    pageUrl: table.text().notNull(),
    redirectPageUrl: table.text(),
    byboxWinner: table.boolean().notNull(),
    status: ProductOfferStatusEnum().notNull(),
    createdAt,
    updatedAt,
  };
});

export type IProductOffer = typeof ProductOfferTable.$inferSelect;
export type IProductOfferInsertForm = typeof ProductOfferTable.$inferInsert;
export type IProductOfferUpdateForm = Partial<IProductOffer>;
export type IProductOfferView = Omit<IProductOffer, "pageUrl"> & {
  shop: IShop;
};

export const ProductOfferRelations = relations(
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
