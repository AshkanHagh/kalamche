import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { store } from "./store";

export type ProductSpecifications = {
  title: string;
  description: string;
};

export type ProductImages = {
  id: string;
  url: string;
};

export const product = sqliteTable("products", {
  id: text("id")
    .primaryKey()
    .$default(() => uuid()),
  store_id: text("store_id")
    .notNull()
    .references(() => store.id),
  name: text("name", { length: 255 }).notNull(),
  description: text("description", { length: 255 }).notNull(),
  specifications: text("specifications", { mode: "json" })
    .$type<ProductSpecifications[]>()
    .notNull(),
  price: integer("price").notNull(),
  images: text("images", { mode: "json" }).notNull().$type<ProductImages[]>(),
  category: text("category").notNull(),
  quantity: integer("quantity").notNull(),
  callbackUrl: text("callback_url", { length: 300 }).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const productRelations = relations(product, ({ one }) => ({
  store: one(store, {
    fields: [product.store_id],
    references: [store.id],
  }),
}));
