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
  countTotal(tx: Database, productId: string, isTemp: boolean): Promise<number>;

  isThumbnailExists(
    tx: Database,
    productId: string,
    isTemp: boolean,
  ): Promise<boolean>;

  findManyByTempProductId(
    tx: Database,
    tempProductId: string,
  ): Promise<IProductImage[]>;

  updateByTempProductId(
    tx: Database,
    tempProductId: string,
    form: IProductImageUpdateForm,
  ): Promise<void>;
}
