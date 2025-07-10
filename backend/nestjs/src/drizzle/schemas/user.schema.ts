import { index, pgEnum, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { UserOAuthAccountTable } from "./user-oauth-account.schema";
import { UserLoginTokenTable } from "./user-login-token.schema";
import { USER_ROLE } from "src/constants/global.constant";
import { id } from "./schema.helper";
import { ShopTable } from "./shop.schema";
import { ProductLikeTable } from "./product-like-schema";

export const UserRoleEnum = pgEnum("user_roles_enum", USER_ROLE);

export const UserTable = pgTable(
  "users",
  (table) => {
    return {
      id,
      name: table.varchar({ length: 255 }).notNull(),
      // not unique because user can have 2 account with one email(regular auth, oauth)
      email: table.varchar({ length: 255 }).notNull(),
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
  oauthAccount: one(UserOAuthAccountTable),
  loginToken: one(UserLoginTokenTable),
  shop: one(ShopTable),
  likedProducts: many(ProductLikeTable),
}));
