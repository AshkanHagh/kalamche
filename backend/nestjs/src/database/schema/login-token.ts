import { pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user";
import { relations } from "drizzle-orm";

export const LoginTokenSchema = pgTable("login_tokens", (table) => ({
  userId: table
    .uuid()
    .primaryKey()
    .references(() => UserSchema.id)
    .notNull(),
  tokenHash: table.varchar({ length: 300 }).notNull(),
  ip: table.varchar().notNull(),
  createdAt: table
    .timestamp({ withTimezone: true })
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
