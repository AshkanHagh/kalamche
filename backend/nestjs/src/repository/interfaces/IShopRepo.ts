import {
  IShop,
  IShopInsertForm,
  IShopRecord,
  IShopUpdateForm,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IShopRepo {
  findByUserId(userId: string): Promise<IShop | undefined>;
  insert(tx: Database, form: IShopInsertForm): Promise<IShop>;
  findById(id: string): Promise<IShopRecord>;
  userHasShop(userId: string): Promise<boolean>;
  update(tx: Database, id: string, form: IShopUpdateForm): Promise<IShopRecord>;
  delete(tx: Database, id: string): Promise<void>;
}
