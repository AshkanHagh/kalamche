import { IProductOffer, IProductOfferInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IProductOfferRepo {
  checkShopOfferExists(shopId: string, productId: string): Promise<boolean>;
  insert(tx: Database, form: IProductOfferInsertForm): Promise<IProductOffer>;
  findByProductId(productId: string): Promise<IProductOffer>;
}
