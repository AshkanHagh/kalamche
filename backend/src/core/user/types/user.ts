import { InferSelectModel } from "drizzle-orm";
import { user } from "src/database/schemas";

export type User = InferSelectModel<typeof user>;

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt: string | null;
};
