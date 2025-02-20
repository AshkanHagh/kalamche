import { relations } from "drizzle-orm";
import { userSchema } from "./user";
import { productSchema } from "./product";
import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { Image } from "./types";

export const storeSchema = pgTable("stores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userSchema.id),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: varchar("description", { length: 500 }).notNull(),
  image: jsonb().notNull().$type<Image>(),
  siteUrl: varchar("site_url", { length: 300 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const storeRelations = relations(storeSchema, ({ one, many }) => ({
  user: one(userSchema, {
    fields: [storeSchema.userId],
    references: [userSchema.id],
    relationName: "fk_users_stores",
  }),
  products: many(productSchema),
}));
