import { InferSelectModel } from "drizzle-orm";
import { storeSchema } from "src/database/schemas";
import { Image } from "../../image/types/image";

export type Store = InferSelectModel<typeof storeSchema>;

export type StoreRecord = {
  id: string;
  name: string;
  userId: string;
  description: string;
  image: Image;
  siteUrl: string;
  createdAt: string | null;
};
