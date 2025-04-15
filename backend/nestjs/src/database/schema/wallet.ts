import { relations } from "drizzle-orm";
import { pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user";

export const WalletSchema = pgTable("wallets", (table) => {
  return {
    id: table.uuid().primaryKey().defaultRandom(),
    userId: table
      .uuid()
      .primaryKey()
      .references(() => UserSchema.id),
    frTokens: table.integer().notNull(),
    createdAt: table.timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: table
      .timestamp({ withTimezone: true })
      .defaultNow()
      .$onUpdateFn(() => new Date())
      .notNull(),
  };
});

export const WalletRelations = relations(WalletSchema, ({ one }) => ({
  user: one(UserSchema, {
    fields: [WalletSchema.userId],
    references: [UserSchema.id],
  }),
}));
