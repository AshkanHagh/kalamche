import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type Database = NodePgDatabase<typeof schema>;

export type IPendingUser = InferSelectModel<typeof schema.PendingUserTable>;

export type IPendingUserInsertForm = InferInsertModel<
  typeof schema.PendingUserTable
>;

export type IPendingUserUpdateForm = Partial<IPendingUserInsertForm>;

export type IUserLoginToken = InferSelectModel<
  typeof schema.UserLoginTokenTable
>;

export type IUserLoginTokenInsertForm = InferInsertModel<
  typeof schema.UserLoginTokenTable
>;

export type IUserOAuthAccount = InferSelectModel<
  typeof schema.UserOAuthAccountTable
>;

export type IUserOAuthAccountInsertForm = InferInsertModel<
  typeof schema.UserLoginTokenTable
>;

export type IUser = InferSelectModel<typeof schema.UserTable>;

export type IUserInsertForm = InferInsertModel<typeof schema.UserTable>;

export interface IUserView {
  user: Omit<IUser, "passwordHash" | "updatedAt">;
  // not implemented yet
  wallet?: unknown;
}

export type IProduct = InferSelectModel<typeof schema.ProductTable>;

export type IProductInsertForm = InferInsertModel<typeof schema.ProductTable>;

export type IShop = InferSelectModel<typeof schema.ShopTable>;

export type IShopInsertForm = InferInsertModel<typeof schema.ShopTable>;

export type IProductPriceHistory = InferSelectModel<
  typeof schema.ProductPriceHistoryTable
>;

export type IProductPriceHistoryInsertForm = InferInsertModel<
  typeof schema.ProductPriceHistoryTable
>;

export type IProductOfferInsertForm = InferInsertModel<
  typeof schema.ProductOfferTable
>;
