import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { OAuthAccountSchema } from "./oauth-account";
import { LoginTokenSchema } from "./login-token";
import { PaymentHistorySchema } from "./payment-history";
import { WalletSchema } from "./wallet";
import { UserRoleSchema } from "./user-role";

export const UserSchema = pgTable("users", (table) => ({
  id: table.uuid().primaryKey().defaultRandom(),
  name: table.varchar({ length: 255 }).notNull(),
  email: table.varchar({ length: 255 }).notNull().unique(),
  avatarUrl: table.varchar({ length: 300 }).notNull().default("#"),
  passwordHash: table.varchar({ length: 300 }),
  createdAt: table.timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: table
    .timestamp({ withTimezone: true })
    .defaultNow()
    .$onUpdateFn(() => new Date())
    .notNull(),
}));

export const UserTableRelations = relations(UserSchema, ({ many, one }) => ({
  userRole: many(UserRoleSchema),
  oauthAccount: one(OAuthAccountSchema),
  loginToken: one(LoginTokenSchema),
  paymentHistory: many(PaymentHistorySchema, {
    relationName: "user_payment_history",
  }),
  wallet: one(WalletSchema),
}));
