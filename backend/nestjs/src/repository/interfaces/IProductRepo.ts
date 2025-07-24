import {
  Database,
  IProduct,
  IProductInsertForm,
  IProductView,
} from "src/drizzle/types";

export interface IProductRepo {
  findByUpc(upc: string): Promise<IProduct | undefined>;
  findById(id: string): Promise<IProduct>;
  insert(tx: Database, form: IProductInsertForm): Promise<IProduct>;
  findProductViewByUpc(upc: string): Promise<IProductView | undefined>;
  exists(id: string): Promise<void>;
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
