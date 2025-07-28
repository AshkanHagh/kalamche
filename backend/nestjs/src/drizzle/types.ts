import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { Pool } from "pg";

export type Database = NodePgDatabase<typeof schema> & {
  $client?: Pool;
};

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

export type IUser = InferSelectModel<typeof schema.UserTable>;
export type IUserInsertForm = InferInsertModel<typeof schema.UserTable>;
export type IUserUpdateForm = Partial<IUser>;
export type IUserRecord = Omit<IUser, "passwordHash" | "updatedAt">;

export type IShop = InferSelectModel<typeof schema.ShopTable>;
export type IShopInsertForm = InferInsertModel<typeof schema.ShopTable>;
export type IShopUpdateForm = Partial<IShop>;
export type IShopRecord = Omit<IShop, "emailVerifiedAt" | "updatedAt">;
