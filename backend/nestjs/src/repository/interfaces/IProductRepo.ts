import { IProduct, IProductInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

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

  // findProductsByFilter(
  //   sort: "cheapest" | "view" | "newest" | "expensive" | "popular",
  //   brand: string,
  //   search: string,
  //   prMax: number,
  //   prMin: number,
  //   limit: number,
  //   offset: number,
  // ): Promise<unknown>;
}
