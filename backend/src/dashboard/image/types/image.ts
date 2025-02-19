import { InferSelectModel } from "drizzle-orm";
import { image } from "src/database/schemas";

export type Image = InferSelectModel<typeof image>;

export enum UploadType {
  Avatar = "avatar",
  Product = "product",
}
