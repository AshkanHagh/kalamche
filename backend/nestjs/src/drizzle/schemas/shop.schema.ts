import { pgEnum, pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { ProductTable } from "./product.schema";
import { ProductOfferTable } from "./product-offer.schema";
import { TempProductTable } from "./temp-product.schema";
import { ShopViewTable } from "./shop-view.schema";

export const ShopStatusEnum = pgEnum("shop_status", [
  "pending",
  "verified",
  "denied",
]);

// NOTE: removed status field(no admin panel will impl yet)
// NOTE: added default value for emailVerifiedAt(no verification for email for now)
export const ShopTable = pgTable("shops", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    name: table.varchar({ length: 255 }).notNull(),
    description: table.text().notNull(),
    email: table.varchar({ length: 255 }).unique().notNull(),
    emailVerifiedAt: table.timestamp().notNull().defaultNow(),
    phone: table.varchar({ length: 50 }).notNull(),
    website: table.text().notNull(),
    imageUrl: table.text(),
    country: table.text().notNull(),
    city: table.text().notNull(),
    state: table.text().notNull(),
    streetAddress: table.text().notNull(),
    zipCode: table.text().notNull(),
    status: ShopStatusEnum().default("pending"),
    createdAt,
    updatedAt,
  };
});

export type IShop = typeof ShopTable.$inferSelect;
export type IShopInsertForm = typeof ShopTable.$inferInsert;
export type IShopUpdateForm = Partial<IShop>;
export type IShopRecord = Omit<IShop, "emailVerifiedAt" | "updatedAt">;

export const ShopRelations = relations(ShopTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [ShopTable.userId],
    references: [UserTable.id],
  }),
  products: many(ProductTable),
  offers: many(ProductOfferTable),
  tempProducts: many(TempProductTable),
  views: many(ShopViewTable),
}));
