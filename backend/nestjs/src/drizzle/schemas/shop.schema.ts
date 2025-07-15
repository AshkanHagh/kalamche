import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";
import { UserTable } from "./user.schema";
import { relations } from "drizzle-orm";
import { ProductTable } from "./product.schema";
import { ProductOfferTable } from "./product-offer.schema";

// NOTE: removed status field(no admin panel will impl yet)
// NOTE: added default value for emailVerifiedAt(no verification for email for now)
export const ShopTable = pgTable("shops", (table) => {
  return {
    id,
    userId: table
      .uuid()
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    name: table.varchar({ length: 255 }),
    description: table.text(),
    email: table.varchar({ length: 255 }),
    emailVerifiedAt: table.timestamp().defaultNow(),
    phone: table.varchar({ length: 50 }),
    website: table.text(),
    imageUrl: table.text(),
    country: table.text(),
    city: table.text(),
    state: table.text(),
    streetAddress: table.text(),
    zipCode: table.integer(),
    taxId: table.text().unique(),
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
  vendors: many(ProductOfferTable),
}));
