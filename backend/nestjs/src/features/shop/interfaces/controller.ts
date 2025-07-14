import { IShop } from "src/drizzle/types";

export interface IShopController {
  createShop(userId: string): Promise<IShop>;
}
