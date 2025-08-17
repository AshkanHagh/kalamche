import {
  IProductImage,
  IProductImageInsertForm,
  IProductImageUpdateForm,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IProductImageRepo {
  insert(tx: Database, form: IProductImageInsertForm): Promise<IProductImage>;
  update(
    tx: Database,
    imageId: string,
    form: IProductImageUpdateForm,
  ): Promise<void>;
  countTotal(productId: string, isTemp: boolean): Promise<number>;
  isThumbnailExists(productId: string, isTemp: boolean): Promise<boolean>;

  findManyByProductId(
    tx: Database,
    productId: string,
    isTemp: boolean,
  ): Promise<IProductImage[]>;

  deleteByProductId(
    tx: Database,
    productId: string,
    isTemp: boolean,
  ): Promise<IProductImage[]>;

  delete(tx: Database, id: string): Promise<IProductImage>;

  updateByTempProductId(
    tx: Database,
    tempProductId: string,
    form: IProductImageUpdateForm,
  ): Promise<void>;
}
