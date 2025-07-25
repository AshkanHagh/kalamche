import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id } from "./schema.helper";

export const OAuthStateTable = pgTable("oauth_states", (table) => {
  return {
    id,
    state: table.varchar({ length: 255 }).unique().notNull(),
    provider: table.varchar({ length: 50 }).notNull(),
    codeVerifier: table.varchar({ length: 128 }),
    createdAt,
  };
});

export type IOAuthState = typeof OAuthStateTable.$inferSelect;
export type IOAuthStateInsertForm = typeof OAuthStateTable.$inferInsert;
