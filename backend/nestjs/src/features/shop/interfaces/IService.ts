import { IShop, IShopRecord } from "src/drizzle/types";
import { UpdateShopCreationDto, UpdateShopDto, UploadImageDto } from "../dto";
import { ITempShop } from "src/drizzle/schemas";

export interface IShopService {
  createShop(userId: string): Promise<ITempShop>;
  uploadImage(
    userId: string,
    params: UploadImageDto,
    image: Express.Multer.File,
  ): Promise<void>;
  completeShopCreation(
    userId: string,
    tempShopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop>;
  deleteTempShop(userId: string, tempShopId: string): Promise<void>;
  deleteShop(userId: string, shopId: string): Promise<void>;
  getShop(shopId: string): Promise<IShopRecord>;
  updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShopRecord>;
}
