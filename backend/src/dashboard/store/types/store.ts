import { InferSelectModel } from "drizzle-orm";
import { storeSchema } from "src/database/schemas";

export type Store = InferSelectModel<typeof storeSchema>;

export type StoreRecord = Omit<Store, "updatedAt">;
