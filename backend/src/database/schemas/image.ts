import { relations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { storeSchema } from "./store";

export const image = sqliteTable("images", {
  id: text("id")
    .primaryKey()
    .$default(() => uuid()),
  url: text().notNull().unique(),
});

export const imageRelations = relations(image, ({ many }) => ({
  stores: many(storeSchema, {
    relationName: "fk_images_stores",
  }),
}));
