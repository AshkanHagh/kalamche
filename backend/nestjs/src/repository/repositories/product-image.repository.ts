import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IProductImageRepo } from "../interfaces/IProductImageRepo";
import {
  IProductImageInsertForm,
  IProductImage,
  ProductImageTable,
  IProductImageUpdateForm,
} from "src/drizzle/schemas";
import { and, count, eq, SQL } from "drizzle-orm";

@Injectable()
export class ProductImageRepository implements IProductImageRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(
    tx: Database = this.db,
    form: IProductImageInsertForm,
  ): Promise<IProductImage> {
    const [image] = await tx.insert(ProductImageTable).values(form).returning();
    return image;
  }

  async update(
    tx: Database = this.db,
    imageId: string,
    form: IProductImageUpdateForm,
  ): Promise<void> {
    await tx
      .update(ProductImageTable)
      .set(form)
      .where(eq(ProductImageTable.id, imageId))
      .returning();
  }

  async countTotal(
    tx: Database = this.db,
    productId: string,
    isTemp: boolean,
  ): Promise<number> {
    const query = this.#buildProductImageQuery(productId, isTemp);
    const [images] = await tx
      .select({ count: count() })
      .from(ProductImageTable)
      .where(and(query, eq(ProductImageTable.isThumbnail, false)));
    return images.count;
  }

  async isThumbnailExists(
    tx: Database = this.db,
    productId: string,
    isTemp: boolean,
  ): Promise<boolean> {
    const query = this.#buildProductImageQuery(productId, isTemp);
    const result = await tx.query.ProductImageTable.findFirst({
      where: and(query, eq(ProductImageTable.isThumbnail, true)),
      columns: {
        id: true,
      },
    });
    return result ? true : false;
  }

  #buildProductImageQuery(productId: string, isTemp: boolean) {
    let query: SQL = eq(ProductImageTable.id, productId);
    if (isTemp) {
      query = eq(ProductImageTable.tempProductId, productId);
    }
    return query;
  }
}
