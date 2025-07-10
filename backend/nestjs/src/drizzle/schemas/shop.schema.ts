import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { ProductTable } from "./product.schema";

export const ShopStatusEnum = pgEnum("shop_status_enum", [
  "active",
  "pending",
  "closed",
]);

export const ShopTable = pgTable("shops", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    name: table.varchar({ length: 255 }).notNull(),
    description: table.text().notNull(),
    email: table.varchar({ length: 255 }).notNull(),
    emailVerifiedAt: table.timestamp(),
    phone: table.varchar({ length: 50 }).notNull(),
    website: table.text().notNull(),
    imageUrl: table.text(),
    streetAddress: table.text().notNull(),
    city: table.text().notNull(),
    state: table.text().notNull(),
    zipCode: table.integer().notNull(),
    taxId: table.text().notNull(),
    status: ShopStatusEnum().notNull().default("pending"),
    createdAt,
    updatedAt,
  };
});

export const ShopRelations = relations(ShopTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [ShopTable.userId],
    references: [UserTable.id],
  }),
  products: many(ProductTable),
}));
