import { relations } from "drizzle-orm";
import { storeSchema } from "./store";
import {
  index,
  jsonb,
  pgTable,
  real,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { Image, ProductDetails } from "./types";

export const productSchema = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storeId: uuid("store_id")
      .notNull()
      .references(() => storeSchema.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    description: varchar("description", { length: 255 }).notNull(),
    details: jsonb().array().notNull().$type<ProductDetails[]>(),
    price: real("price").notNull(),
    images: jsonb().notNull().array().$type<Image[]>(),
    category: jsonb().array().notNull().$type<string[]>(),
    callbackUrl: varchar("callback_url", { length: 300 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idxCategory: index("idx_products_category").using("gin", table.category),
    idxDetails: index("idx_products_details").using("gin", table.details),
    idxStoreId: index("idx_products_store_id").on(table.storeId),
    idxNameAndDescription: index("idx_products_name_and_description").on(
      table.name,
      table.description,
    ),
  }),
);

export const productRelations = relations(productSchema, ({ one }) => ({
  storeSchema: one(storeSchema, {
    fields: [productSchema.storeId],
    references: [storeSchema.id],
  }),
}));
