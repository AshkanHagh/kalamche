import { pgTable } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./schema.helper";

export const RateLimitBucketTable = pgTable("rate_limit_buckets", (table) => {
  return {
    id,
    identifier: table.text().notNull(),
    tokens: table.smallint().notNull(),
    lastRefil: table.timestamp().defaultNow().notNull(),
    createdAt,
    updatedAt,
  };
});

export type IRateLimitBucket = typeof RateLimitBucketTable.$inferSelect;
export type IRateLimitBucketInsertForm =
  typeof RateLimitBucketTable.$inferInsert;
export type IRateLimitBucketUpdateForm = Partial<IRateLimitBucketInsertForm>;
