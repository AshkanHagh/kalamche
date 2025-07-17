import { IShop, IUser } from "src/drizzle/types";
import { UpdateShopCreationDto } from "../dto";

export interface IShopService {
  createShop(user: IUser): Promise<IShop>;
  uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void>;
  updateShopCreation(
    userId: string,
    shopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop>;
  deleteShop(userId: string, shopId: string): Promise<void>;
}
