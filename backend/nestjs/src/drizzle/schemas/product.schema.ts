import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { ShopTable } from "./shop.schema";
import { relations } from "drizzle-orm";
import { ProductImageTable } from "./product-image.schema";
import { ProductPriceHistoryTable } from "./product-price-history.schema";
import { ProductLikeTable } from "./product-like-schema";

export const ProductStatusEnum = pgEnum("product_status_enum", [
  "draft",
  "public",
]);

export const ProductTable = pgTable("products", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .notNull()
      .references(() => ShopTable.id, { onDelete: "cascade" }),
    name: table.varchar({ length: 500 }).notNull(),
    description: table.text().notNull(),
    price: table.real().notNull(),
    status: ProductStatusEnum().notNull().default("draft"),
    categories: table.text().array().notNull(),
    brand: table.text().notNull(),
    specifications: table
      .jsonb()
      .array()
      .$type<{ key: string; value: string }[]>()
      .notNull(),
    website: table.text().notNull(),
    views: table.integer().notNull().default(0),
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
}));
