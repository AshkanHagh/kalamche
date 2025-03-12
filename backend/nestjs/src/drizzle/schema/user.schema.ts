import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";
import { index, pgTable } from "drizzle-orm/pg-core";
import { UserPermissionSchema } from "./user-permission.schema";
import { OAuthAccountSchema } from "./oauth-account.schema";
import { LoginTokenSchema } from "./login-token.schema";

export const UserSchema = pgTable(
  "users",
  (table) => ({
    id: table.uuid().primaryKey().defaultRandom(),
    name: table.varchar({ length: 255 }).notNull(),
    email: table.varchar({ length: 255 }).notNull().unique(),
    avatarUrl: table.varchar({ length: 300 }).notNull(),
    createdAt: table.timestamp().defaultNow().notNull(),
    updatedAt: table
      .timestamp()
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  }),
  (table) => ({
    idxUserEmail: index("idx_user_email").on(table.email),
  }),
);

export const UserTableRelations = relations(UserSchema, ({ many, one }) => ({
  permissions: many(UserPermissionSchema, {
    relationName: "fk_user_permission_permission",
  }),
  oauthAccount: one(OAuthAccountSchema),
  loginToken: one(LoginTokenSchema),
}));

export type User = InferSelectModel<typeof UserSchema>;
export type UserRecord = Omit<
  User,
  "refreshTokenHash" | "updatedAt" | "lastLogin"
> & {
  permissions: string[];
};
export type InsertUser = InferInsertModel<typeof UserSchema>;
