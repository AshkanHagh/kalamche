import {
  IRateLimitBucket,
  IRateLimitBucketInsertForm,
  IRateLimitBucketUpdateForm,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IRateLimitBucketRepo {
  insert(
    tx: Database,
    form: IRateLimitBucketInsertForm,
  ): Promise<IRateLimitBucket>;
  update(
    tx: Database,
    id: string,
    form: IRateLimitBucketUpdateForm,
  ): Promise<IRateLimitBucket>;
  findByIdentifier(identifier: string): Promise<IRateLimitBucket | undefined>;
}
