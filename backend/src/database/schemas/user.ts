import { relations, sql } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { v4 as uuid } from "uuid";
import { storeSchema } from "./store";

export const user = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$default(() => uuid()),
    name: text("name", { length: 255 }).notNull(),
    email: text("email", { length: 255 }).notNull().unique(),
    avatarUrl: text("avatar_url", { length: 300 }).notNull(),
    refreshTokenHash: text("refresh_token_hash", { length: 300 }),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => ({
    idx_user_email: index("idx_user_email").on(table.email),
  }),
);

export const userRelations = relations(user, ({ many }) => ({
  stores: many(storeSchema, {
    relationName: "fk_users_stores",
  }),
}));
