import { IShop, IShopRecord } from "src/drizzle/types";
import {
  GetProductPayload,
  PaginationPayload,
  UpdateShopCreationPayload,
  UpdateShopPayload,
  UploadImagePayload,
} from "../dto";
import { IProductRecord, ITempShop } from "src/drizzle/schemas";

export interface IShopService {
  createShop(userId: string): Promise<ITempShop>;

  uploadImage(
    userId: string,
    params: UploadImagePayload,
    imageBuffer: Buffer,
  ): Promise<void>;

  completeShopCreation(
    userId: string,
    tempShopId: string,
    payload: UpdateShopCreationPayload,
  ): Promise<IShop>;

  deleteTempShop(userId: string, tempShopId: string): Promise<void>;

  deleteShop(userId: string, shopId: string): Promise<void>;

  updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopPayload,
  ): Promise<IShopRecord>;

  getProducts(
    userId: string,
    shopId: string,
    params: PaginationPayload,
  ): Promise<IProductRecord[]>;
  getMyShop(userId: string): Promise<IShop>;
  getProduct(userId: string, params: GetProductPayload): Promise<any>;
}
