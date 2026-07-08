import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ProductImageTable } from "./product-image.schema";
import { ProductPriceHistoryTable } from "./product-price-history.schema";
import { ProductLikeTable } from "./product-like-schema";
import { ProductOfferTable } from "./product-offer.schema";
import { ShopTable } from "./shop.schema";
import { ShopViewTable } from "./shop-view.schema";
import { CategoryTable } from "./category.schema";
import { BrandTable } from "./brand.schema";

export const ProductStatus = pgEnum("product_status", ["draft", "public"]);

// TODO: update model number to be unique/notnull in production
export const ProductTable = pgTable("products", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .references(() => ShopTable.id, { onDelete: "set null" }),
    title: table.varchar({ length: 500 }).notNull(),
    description: table.text().notNull(),
    status: ProductStatus().notNull().default("draft"),
    categoryId: table
      .uuid()
      .notNull()
      .references(() => CategoryTable.id),
    brandId: table
      .uuid()
      .notNull()
      .references(() => BrandTable.id),
    specifications: table
      .jsonb()
      .array()
      .$type<{ key: string; value: string }[]>()
      .notNull(),
    initialPrice: table.real().notNull(),
    asin: table.varchar({ length: 20 }).notNull().unique(),
    modelNumber: table.text().notNull(),
    upc: table.varchar({ length: 50 }),
    createdAt,
    updatedAt,
  };
});

export type IProduct = typeof ProductTable.$inferSelect;
export type IProductInsertForm = typeof ProductTable.$inferInsert;

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
  category: one(CategoryTable, {
    fields: [ProductTable.categoryId],
    references: [CategoryTable.id],
  }),
  brand: one(BrandTable, {
    fields: [ProductTable.brandId],
    references: [BrandTable.id],
  }),
}));
