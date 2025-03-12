import { pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user.schema";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

export const LoginTokenSchema = pgTable("login_tokens", (table) => ({
  userId: table
    .uuid()
    .primaryKey()
    .references(() => UserSchema.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: table.varchar({ length: 300 }).notNull(),
  published: table
    .timestamp()
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
}));

export const LoginTokenRelations = relations(LoginTokenSchema, ({ one }) => ({
  user: one(UserSchema, {
    fields: [LoginTokenSchema.userId],
    references: [UserSchema.id],
  }),
}));

export type LoginToken = InferSelectModel<typeof LoginTokenSchema>;
export type InsertLoginToken = InferInsertModel<typeof LoginTokenSchema>;
