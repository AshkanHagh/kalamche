import { IShop, IShopInsertForm, IShopUpdateForm } from "src/drizzle/types";

export interface IShopRepo {
  findByUserId(userId: string): Promise<IShop | undefined>;
  insert(form: IShopInsertForm): Promise<IShop>;
  findById(id: string): Promise<IShop>;
  update(id: string, form: IShopUpdateForm): Promise<IShop>;
  delete(id: string): Promise<void>;
}
