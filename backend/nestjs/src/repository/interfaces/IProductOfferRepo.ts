import {
  Database,
  IProductOffer,
  IProductOfferInsertForm,
} from "src/drizzle/types";

export interface IProductOfferRepo {
  checkShopOfferExists(shopId: string, productId: string): Promise<boolean>;
  insert(tx: Database, form: IProductOfferInsertForm): Promise<IProductOffer>;
}
