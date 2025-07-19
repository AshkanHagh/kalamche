import {
  ITempProduct,
  ITempProductInsertForm,
} from "src/drizzle/schemas/temp-product.schema";

export interface ITempProductRepo {
  insert(form: ITempProductInsertForm): Promise<ITempProduct>;
  delete(id: string): Promise<void>;
}
