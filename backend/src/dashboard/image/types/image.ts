import { InferSelectModel } from "drizzle-orm";
import { image } from "src/database/schemas";

export type Image = InferSelectModel<typeof image>;
