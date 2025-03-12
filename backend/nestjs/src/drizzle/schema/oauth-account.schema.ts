import { pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user.schema";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

export const OAuthAccountSchema = pgTable("oauth_accounts", (table) => ({
  oauthUserId: table.varchar({ length: 50 }).notNull(),
  userId: table
    .uuid()
    .notNull()
    .references(() => UserSchema.id, { onDelete: "cascade" }),
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

export type OAuthAccount = InferSelectModel<typeof OAuthAccountSchema>;
export type InsertOAuthAccount = InferInsertModel<typeof OAuthAccountSchema>;
