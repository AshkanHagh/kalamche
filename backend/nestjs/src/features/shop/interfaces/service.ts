import { IShop } from "src/drizzle/types";

export interface IShopService {
  createShop(userId: string): Promise<IShop>;
  uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void>;
}
