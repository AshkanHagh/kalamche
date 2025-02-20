import { InferSelectModel } from "drizzle-orm";
import { userSchema } from "src/database/schemas";

export type User = InferSelectModel<typeof userSchema>;

export type UserRecord = Omit<User, "updatedAt" | "refreshTokenHash">;
