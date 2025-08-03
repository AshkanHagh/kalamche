import { pgTable, primaryKey } from "drizzle-orm/pg-core";
import { UserTable } from "./user.schema";
import { ProductTable } from "./product.schema";
import { relations } from "drizzle-orm";

export const ProductLikeTable = pgTable(
  "product_likes",
  (table) => {
    return {
      userId: table
        .uuid()
        .references(() => UserTable.id, { onDelete: "cascade" }),
      productId: table
        .uuid()
        .references(() => ProductTable.id, { onDelete: "cascade" }),
    };
  },
  (table) => [primaryKey({ columns: [table.userId, table.productId] })],
);

export type IProductLike = typeof ProductLikeTable.$inferSelect;
export type IProductLikeInsertForm = typeof ProductLikeTable.$inferInsert;

export const ProductLikeRelations = relations(ProductLikeTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [ProductLikeTable.userId],
    references: [UserTable.id],
  }),
  product: one(ProductTable, {
    fields: [ProductLikeTable.productId],
    references: [ProductTable.id],
  }),
}));
