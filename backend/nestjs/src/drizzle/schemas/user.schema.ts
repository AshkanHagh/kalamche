import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { UserLoginTokenTable } from "./user-login-token.schema";
import { USER_ROLE } from "src/constants/global.constant";
import { id } from "./schema.helper";
import { ShopTable } from "./shop.schema";
import { ProductLikeTable } from "./product-like-schema";
import { OAuthAccountTable } from "./oauth-account.schema";
import { TempShopTable } from "./temp-shop.schema";
import { WalletTable } from "./wallet.schema";

export const UserRoleEnum = pgEnum("user_roles_enum", USER_ROLE);

export const UserTable = pgTable(
  "users",
  (table) => {
    return {
      id,
      name: table.varchar({ length: 255 }).notNull(),
      email: table.varchar({ length: 255 }).unique().notNull(),
      roles: UserRoleEnum().array().notNull(),
      passwordHash: table.text(),
      createdAt: table.timestamp().notNull().defaultNow(),
      updatedAt: table
        .timestamp()
        .notNull()
        .defaultNow()
        .$onUpdateFn(() => new Date()),
    };
  },
  (table) => [index("idx_user_email").on(table.email)],
);

export const UserRelations = relations(UserTable, ({ one, many }) => ({
  oauthAccount: one(OAuthAccountTable),
  loginToken: one(UserLoginTokenTable),
  shop: one(ShopTable),
  likedProducts: many(ProductLikeTable),
  tempShop: one(TempShopTable),
  wallet: one(WalletTable),
}));
