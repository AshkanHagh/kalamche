import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";

export const TempShopTable = pgTable("temp_shops", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .unique()
      .references(() => UserTable.id),
    imageUrl: table.text(),
    createdAt,
  };
});

export type ITempShop = typeof TempShopTable.$inferSelect;
export type ITempShopInsertForm = typeof TempShopTable.$inferInsert;
export type ITempShopUpdateForm = Partial<ITempShopInsertForm>;

export const TempShopRelations = relations(TempShopTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [TempShopTable.userId],
    references: [UserTable.id],
  }),
}));
