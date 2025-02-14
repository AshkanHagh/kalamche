import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { user } from "./user";
import { product } from "./product";

export const store = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$default(() => uuid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name", { length: 255 }).notNull().unique(),
  description: text("description", { length: 500 }).notNull(),
  avatar_url: text("avatar_url", { length: 300 }).notNull(),
  siteUrl: text("site_url", { length: 300 }).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const storeRelations = relations(store, ({ one, many }) => ({
  user: one(user, {
    fields: [store.userId],
    references: [user.id],
    relationName: "fk_users_stores",
  }),
  products: many(product),
}));
