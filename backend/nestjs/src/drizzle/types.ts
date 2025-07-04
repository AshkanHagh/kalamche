import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";

export type Database = NodePgDatabase<typeof schema>;

export interface IPendingUser {
  id: string;
  email: string;
  passwordHash: string;
  token: string;
  createdAt: Date;
}

export interface IPendingUserInsertForm {
  email: string;
  passwordHash: string;
  token: string;
}

export interface IPendingUserUpdateForm {
  email?: string;
  passwordHash?: string;
  token?: string;
}

export interface IUserLoginToken {
  userId: string;
  token: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: Date;
}

export interface IUserLoginTokenInsertForm {
  userId: string;
  token: string;
  userAgent?: string;
  ip?: string;
}

export interface IUserOAuthAccount {
  oauthId: string;
  userId: string;
}

export interface IUserOAuthAccountInsertForm {
  oauthId: string;
  userId: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInsertForm {
  name: string;
  email: string;
  passwordHash: string | null;
}

export interface IUserView {
  user: Omit<IUser, "passwordHash" | "updatedAt">;
  // not implemented yet
  wallet?: unknown;
  // not implemented yet
  roles: string[];
}
