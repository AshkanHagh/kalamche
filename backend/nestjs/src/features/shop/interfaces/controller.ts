import { IShop, IUser } from "src/drizzle/types";
import { UpdateShopCreationDto, UpdateShopDto } from "../dto";

export interface IShopController {
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
  getShop(shopId: string): Promise<IShop>;
  updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShop>;
}
