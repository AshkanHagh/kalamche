import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ProductImageTable } from "./product-image.schema";
import {
  IProductPriceHistory,
  ProductPriceHistoryTable,
} from "./product-price-history.schema";
import { ProductLikeTable } from "./product-like-schema";
import { IProductOfferView, ProductOfferTable } from "./product-offer.schema";
import { ShopTable } from "./shop.schema";
import { ShopViewTable } from "./shop-view.schema";

export const ProductStatusEnum = pgEnum("product_status_enum", [
  "draft",
  "public",
]);

// model number is unique in production
// NOTE this must be unique and not null
export const ProductTable = pgTable("products", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .references(() => ShopTable.id, { onDelete: "set null" }),
    title: table.varchar({ length: 500 }).notNull(),
    description: table.text().notNull(),
    status: ProductStatusEnum().notNull().default("draft"),
    categories: table.text().array().notNull(),
    brand: table.text().notNull(),
    specifications: table
      .jsonb()
      .array()
      .$type<{ key: string; value: string }[]>()
      .notNull(),
    initialPrice: table.real().notNull(),
    asin: table.varchar({ length: 10 }).notNull().unique(),
    modelNumber: table.text().notNull(),
    upc: table.varchar({ length: 50 }),
    vector: table.text(),
    createdAt,
    updatedAt,
  };
});

export type IProduct = typeof ProductTable.$inferSelect;
export type IProductInsertForm = typeof ProductTable.$inferInsert;
// Product record for search and similar product results,
// excluding vector and initialPrice, and using only the primary image
export type IProductRecord = Omit<IProduct, "vector" | "initialPrice"> & {
  imageUrl: string;
  price: number;
};
export type IProductView = Omit<IProduct, "vector" | "initialPrice"> & {
  offers: IProductOfferView[];
  priceHistory: IProductPriceHistory[];
  views: number;
  likes: number;
};

export const ProductRelations = relations(ProductTable, ({ one, many }) => ({
  shop: one(ShopTable, {
    fields: [ProductTable.shopId],
    references: [ShopTable.id],
  }),
  images: many(ProductImageTable),
  priceHistory: many(ProductPriceHistoryTable),
  likes: many(ProductLikeTable),
  offers: many(ProductOfferTable),
  views: many(ShopViewTable),
}));
