import { IShop } from "src/drizzle/types";

export interface IShopService {
  createShop(userId: string): Promise<IShop>;
}
