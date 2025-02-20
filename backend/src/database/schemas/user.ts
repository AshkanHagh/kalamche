import { relations } from "drizzle-orm";
import { storeSchema } from "./store";
import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userSchema = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    avatarUrl: varchar("avatar_url", { length: 300 }).notNull(),
    refreshTokenHash: varchar("refresh_token_hash", { length: 300 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    idx_user_email: index("idx_user_email").on(table.email),
  }),
);

export const userRelations = relations(userSchema, ({ many }) => ({
  stores: many(storeSchema, {
    relationName: "fk_users_stores",
  }),
}));
