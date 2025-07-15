import { IShop, IUser } from "src/drizzle/types";
import { UpdateShopDto } from "../dto";

export interface IShopController {
  createShop(user: IUser): Promise<IShop>;
  uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void>;
  updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShop>;
}
