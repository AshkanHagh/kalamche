import {
  ITempShop,
  ITempShopInsertForm,
  ITempShopUpdateForm,
} from "src/drizzle/schemas/temp-shop.schema";
import { Database } from "src/drizzle/types";

export interface ITempShopRepo {
  findById(id: string): Promise<ITempShop>;
  existsByUserId(userId: string): Promise<boolean>;
  insert(tx: Database, form: ITempShopInsertForm): Promise<ITempShop>;
  delete(tx: Database, id: string): Promise<void>;
  update(
    tx: Database,
    id: string,
    form: ITempShopUpdateForm,
  ): Promise<ITempShop>;
}
