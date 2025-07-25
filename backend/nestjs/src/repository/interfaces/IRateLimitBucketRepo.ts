import {
  IRateLimitBucket,
  IRateLimitBucketInsertForm,
  IRateLimitBucketUpdateForm,
} from "src/drizzle/schemas";

export interface IRateLimitBucketRepo {
  insert(form: IRateLimitBucketInsertForm): Promise<IRateLimitBucket>;
  update(
    id: string,
    form: IRateLimitBucketUpdateForm,
  ): Promise<IRateLimitBucket>;
  findByIdentifier(identifier: string): Promise<IRateLimitBucket | undefined>;
}
