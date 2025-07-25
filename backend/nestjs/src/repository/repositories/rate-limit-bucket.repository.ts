import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE } from "src/drizzle/constants";
import {
  IRateLimitBucketInsertForm,
  IRateLimitBucketUpdateForm,
  RateLimitBucketTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { IRateLimitBucketRepo } from "../interfaces/IRateLimitBucketRepo";

@Injectable()
export class RateLimitBucketRepository implements IRateLimitBucketRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IRateLimitBucketInsertForm) {
    const [bucket] = await this.db
      .insert(RateLimitBucketTable)
      .values(form)
      .returning();
    return bucket;
  }

  async update(id: string, form: IRateLimitBucketUpdateForm) {
    const [bucket] = await this.db
      .update(RateLimitBucketTable)
      .set(form)
      .where(eq(RateLimitBucketTable.id, id))
      .returning();
    return bucket;
  }

  async findByIdentifier(identifier: string) {
    const [bucket] = await this.db
      .select()
      .from(RateLimitBucketTable)
      .where(eq(RateLimitBucketTable.identifier, identifier));
    return bucket;
  }
}
