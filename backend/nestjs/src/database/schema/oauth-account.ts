import { pgTable } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { UserSchema } from "./user";

export const OAuthAccountSchema = pgTable("oauth_accounts", (table) => ({
  oauthUserId: table.varchar({ length: 100 }).notNull(),
  userId: table
    .uuid()
    .notNull()
    .references(() => UserSchema.id),
}));

export const OAuthAccountRelations = relations(
  OAuthAccountSchema,
  ({ one }) => ({
    user: one(UserSchema, {
      fields: [OAuthAccountSchema.userId],
      references: [UserSchema.id],
    }),
  }),
);
