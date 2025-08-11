import { AnyPgColumn, index, pgTable } from "drizzle-orm/pg-core";
import { id } from "./schema.helper";
import { relations } from "drizzle-orm";
import { ProductTable } from "./product.schema";

export const CategoryTable = pgTable(
  "categories",
  (table) => {
    return {
      id,
      name: table.varchar({ length: 120 }).notNull(),
      parentId: table.uuid().references((): AnyPgColumn => CategoryTable.id),
      level: table.smallint().default(0),
      path: table.text().notNull(),
    };
  },
  (table) => [index("idx_categories_parent_id").on(table.parentId)],
);

export type ICategory = typeof CategoryTable.$inferSelect;
export type ICategoryInsertForm = typeof CategoryTable.$inferInsert;

export const CategoryRelations = relations(CategoryTable, ({ one, many }) => ({
  parent: one(CategoryTable, {
    fields: [CategoryTable.parentId],
    references: [CategoryTable.id],
    relationName: "category_parent",
  }),
  children: many(CategoryTable, {
    relationName: "category_parent",
  }),
  products: many(ProductTable),
}));
