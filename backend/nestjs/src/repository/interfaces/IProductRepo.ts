import { IProduct, IProductInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { FilterOptions } from "src/features/product/dto";

export interface IProductRepo {
  findByUpc(upc: string): Promise<IProduct | undefined>;
  findById(id: string): Promise<IProduct>;
  insert(tx: Database, form: IProductInsertForm): Promise<IProduct>;
  exists(id: string): Promise<void>;
  findProductView(id: string): Promise<any>;
  findSimilarProducts(
    product: IProduct,
    limit: number,
    offset: number,
  ): Promise<any>;
  findByShopId(shopId: string, limit: number, offset: number): Promise<any>;
  findWithShop(shopId: string, id: string): Promise<any>;
  findByFilters(
    query: Partial<{ categoryId: string; q: string }>,
    filters: FilterOptions,
  ): Promise<any>;
}
