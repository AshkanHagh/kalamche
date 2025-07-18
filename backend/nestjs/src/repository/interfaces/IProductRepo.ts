export interface IProductRepo {
  findProductsByFilter(
    sort: "cheapest" | "view" | "newest" | "expensive" | "popular",
    brand: string,
    search: string,
    prMax: number,
    prMin: number,
    limit: number,
    offset: number,
  ): Promise<unknown>;
}
