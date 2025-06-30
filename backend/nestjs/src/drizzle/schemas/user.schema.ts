import { index, pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { UserOAuthAccountTable } from "./user-oauth-account.schema";
import { UserLoginTokenTable } from "./user-login-token.schema";
import { UserRoleTable } from "./user-role.schema";

export const UserTable = pgTable(
  "users",
  (table) => {
    return {
      id: table.uuid().primaryKey().defaultRandom(),
      name: table.varchar({ length: 255 }).notNull(),
      // not unique because user can have 2 account with one email(regular auth, oauth)
      email: table.varchar({ length: 255 }).notNull(),
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

export const UserRelations = relations(UserTable, ({ many, one }) => ({
  roles: many(UserRoleTable),
  oauthAccount: one(UserOAuthAccountTable),
  loginToken: one(UserLoginTokenTable),
}));
