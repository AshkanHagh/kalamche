import {
  IProductOffer,
  IProductOfferInsertForm,
  IProductOfferUpdateForm,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IProductOfferRepo {
  checkShopOfferExists(shopId: string, productId: string): Promise<boolean>;
  insert(tx: Database, form: IProductOfferInsertForm): Promise<IProductOffer>;
  findShopProductOffer(
    shopId: string,
    productId: string,
  ): Promise<IProductOffer>;
  isByboxWinner(
    tx: Database,
    productId: string,
    finalPrice: number,
  ): Promise<boolean>;
  deleteByProductAndShopId(
    tx: Database,
    shopId: string,
    productId: string,
  ): Promise<void>;
  find(id: string): Promise<IProductOffer>;
  update(id: string, form: IProductOfferUpdateForm): Promise<IProductOffer>;
}
