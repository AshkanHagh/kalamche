import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ProductImageTable } from "./product-image.schema";
import { ProductPriceHistoryTable } from "./product-price-history.schema";
import { ProductLikeTable } from "./product-like-schema";
import { ProductOfferTable } from "./product-offer.schema";
import { ShopTable } from "./shop.schema";

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
      .notNull()
      .references(() => ShopTable.id, { onDelete: "no action" }),
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
    websiteUrl: table.text().notNull(),
    initialPrice: table.real().notNull(),
    views: table.integer().notNull().default(0),
    asin: table.varchar({ length: 10 }).notNull().unique(),
    modelNumber: table.text().notNull(),
    upc: table.varchar({ length: 50 }),
    vector: table.text(),
    createdAt,
    updatedAt,
  };
});

export const ProductRelations = relations(ProductTable, ({ one, many }) => ({
  shop: one(ShopTable, {
    fields: [ProductTable.shopId],
    references: [ShopTable.id],
  }),
  images: many(ProductImageTable),
  priceHistory: many(ProductPriceHistoryTable),
  likes: many(ProductLikeTable),
  offers: many(ProductOfferTable),
}));
