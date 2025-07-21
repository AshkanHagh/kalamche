import { IProductOffer, IProductOfferInsertForm } from "src/drizzle/types";

export interface IProductOfferRepo {
  checkShopOfferExists(shopId: string, productId: string): Promise<boolean>;
  insert(form: IProductOfferInsertForm): Promise<IProductOffer>;
}
