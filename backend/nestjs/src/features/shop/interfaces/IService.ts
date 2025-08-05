import { IShop, IShopRecord } from "src/drizzle/types";
import {
  GetProductDto,
  PaginationDto,
  UpdateShopCreationDto,
  UpdateShopDto,
  UploadImageDto,
} from "../dto";
import { IProductRecord, ITempShop } from "src/drizzle/schemas";

export interface IShopService {
  createShop(userId: string): Promise<ITempShop>;

  uploadImage(
    userId: string,
    params: UploadImageDto,
    imageBuffer: Buffer,
  ): Promise<void>;

  completeShopCreation(
    userId: string,
    tempShopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop>;

  deleteTempShop(userId: string, tempShopId: string): Promise<void>;

  deleteShop(userId: string, shopId: string): Promise<void>;

  updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShopRecord>;

  getProducts(
    userId: string,
    shopId: string,
    params: PaginationDto,
  ): Promise<IProductRecord[]>;
  getMyShop(userId: string): Promise<IShop>;
  getProduct(userId: string, params: GetProductDto): Promise<any>;
}
