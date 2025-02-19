import { relations, sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { user } from "./user";
import { image } from "./image";
import { product } from "./product";

export const storeSchema = sqliteTable("stores", {
  id: text("id")
    .primaryKey()
    .$default(() => uuid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  name: text("name", { length: 255 }).notNull().unique(),
  description: text("description", { length: 500 }).notNull(),
  imageId: text()
    .notNull()
    .references(() => image.id),
  siteUrl: text("site_url", { length: 300 }).notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const storeRelations = relations(storeSchema, ({ one, many }) => ({
  user: one(user, {
    fields: [storeSchema.userId],
    references: [user.id],
    relationName: "fk_users_stores",
  }),
  image: one(image, {
    fields: [storeSchema.imageId],
    references: [image.id],
    relationName: "fk_images_stores",
  }),
  products: many(product),
}));
