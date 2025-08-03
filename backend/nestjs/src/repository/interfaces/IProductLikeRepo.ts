import { IProductLikeInsertForm } from "src/drizzle/schemas";

export interface IProductLikeRepo {
  exists(userId: string, productId: string): Promise<boolean>;
  insert(form: IProductLikeInsertForm): Promise<void>;
  delete(userId: string, productId: string): Promise<void>;
}
