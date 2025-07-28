import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ShopTable } from "./shop.schema";
import { ProductTable } from "./product.schema";

export const ShopViewTable = pgTable("shop_views", (table) => {
  return {
    id,
    shopId: table
      .uuid()
      .notNull()
      .references(() => ShopTable.id),
    productId: table
      .uuid()
      .notNull()
      .references(() => ProductTable.id),
    ip: table.varchar({ length: 46 }).notNull(),
    userAgent: table.text().notNull(),
    tokenCharged: table.integer().notNull(),
    createdAt,
  };
});

export type IShopView = typeof ShopViewTable.$inferSelect;
export type IShopViewInsertForm = typeof ShopViewTable.$inferInsert;
export type IShopViewUpdateForm = Partial<IShopViewInsertForm>;

export const ShopViewRelations = relations(ShopViewTable, ({ one }) => ({
  shop: one(ShopTable, {
    fields: [ShopViewTable.shopId],
    references: [ShopTable.id],
  }),
  product: one(ProductTable, {
    fields: [ShopViewTable.productId],
    references: [ProductTable.id],
  }),
}));
