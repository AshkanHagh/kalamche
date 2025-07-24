import {
  ITempProduct,
  ITempProductInsertForm,
} from "src/drizzle/schemas/temp-product.schema";
import { Database } from "src/drizzle/types";

export interface ITempProductRepo {
  insert(form: ITempProductInsertForm): Promise<ITempProduct>;
  delete(tx: Database, id: string): Promise<void>;
  findById(id: string): Promise<ITempProduct>;
}
