import { IShop, IUser } from "src/drizzle/types";
import { UpdateShopCreationDto } from "../dto";

export interface IShopService {
  createShop(userId: string): Promise<IShop>;
  uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void>;
  updateShopCreation(
    user: IUser,
    shopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop>;
}
