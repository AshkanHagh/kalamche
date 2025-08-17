import { IBrand } from "src/drizzle/schemas";

export interface IBrandRepo {
  exists(id: string): Promise<void>;
  findSimilarBrands(
    query: Partial<{ categoryId: string; q: string }>,
    limit: number,
  ): Promise<IBrand[]>;
  findAll(): Promise<IBrand[]>;
}
