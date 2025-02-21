import { InferSelectModel } from "drizzle-orm";
import { productSchema } from "src/database/schemas";

export type Product = InferSelectModel<typeof productSchema>;

export type ProductRecord = Omit<Product, "updatedAt">;
