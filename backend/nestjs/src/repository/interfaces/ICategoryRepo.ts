import { ICategory } from "src/drizzle/schemas";

export interface ICategoryRepo {
  exists(id: string): Promise<void>;
  findBySlug(slug: string): Promise<ICategory | undefined>;
  findHierarchy(path: string): Promise<ICategory[]>;
  findAll(): Promise<ICategory[]>;
}
