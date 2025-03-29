import { index, pgTable } from "drizzle-orm/pg-core";
import { UserSchema } from "./user.schema";
import { relations } from "drizzle-orm";

export const WalletSchema = pgTable(
  "wallets",
  (table) => {
    return {
      id: table.bigserial({ mode: "number" }).primaryKey().notNull(),
      userId: table
        .bigserial({ mode: "number" })
        .references(() => UserSchema.id),
      clicks: table.bigint({ mode: "number" }).notNull(),
      createdAt: table.timestamp({ withTimezone: true }).defaultNow().notNull(),
      updatedAt: table
        .timestamp({ withTimezone: true })
        .defaultNow()
        .$onUpdateFn(() => new Date())
        .notNull(),
    };
  },
  (table) => [index("wallets_user_id_idx").on(table.userId)],
);

export const WalletRelations = relations(WalletSchema, ({ one }) => ({
  user: one(UserSchema, {
    fields: [WalletSchema.userId],
    references: [UserSchema.id],
  }),
}));
