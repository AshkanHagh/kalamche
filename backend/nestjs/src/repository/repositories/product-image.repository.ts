import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IProductImageRepo } from "../interfaces/IProductImageRepo";
import {
  IProductImageInsertForm,
  ProductImageTable,
  IProductImageUpdateForm,
  IProductImage,
} from "src/drizzle/schemas";
import { and, count, eq, SQL } from "drizzle-orm";

@Injectable()
export class ProductImageRepository implements IProductImageRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(tx: Database, form: IProductImageInsertForm) {
    const [image] = await tx.insert(ProductImageTable).values(form).returning();
    return image;
  }

  async update(tx: Database, imageId: string, form: IProductImageUpdateForm) {
    await tx
      .update(ProductImageTable)
      .set(form)
      .where(eq(ProductImageTable.id, imageId))
      .returning();
  }

  async countTotal(productId: string, isTemp: boolean) {
    const query = this.#buildProductImageQuery(productId, isTemp);
    const [images] = await this.db
      .select({ count: count() })
      .from(ProductImageTable)
      .where(and(query, eq(ProductImageTable.isThumbnail, false)));
    return images.count;
  }

  async isThumbnailExists(productId: string, isTemp: boolean) {
    const query = this.#buildProductImageQuery(productId, isTemp);
    const result = await this.db.query.ProductImageTable.findFirst({
      where: and(query, eq(ProductImageTable.isThumbnail, true)),
      columns: {
        id: true,
      },
    });
    return result ? true : false;
  }

  async findManyByProductId(tx: Database, productId: string, isTemp: boolean) {
    const query = this.#buildProductImageQuery(productId, isTemp);

    return tx
      .select()
      .from(ProductImageTable)
      .where(and(query, eq(ProductImageTable.isCompleted, true)));
  }

  async deleteByProductId(tx: Database, productId: string, isTemp: boolean) {
    const query = this.#buildProductImageQuery(productId, isTemp);

    return await tx.delete(ProductImageTable).where(query).returning();
  }

  async updateByTempProductId(
    tx: Database,
    tempProductId: string,
    form: IProductImageUpdateForm,
  ) {
    await tx
      .update(ProductImageTable)
      .set(form)
      .where(eq(ProductImageTable.tempProductId, tempProductId))
      .returning();
  }

  async delete(tx: Database, id: string): Promise<IProductImage> {
    return (
      await tx
        .delete(ProductImageTable)
        .where(eq(ProductImageTable.id, id))
        .returning()
    )[0];
  }

  #buildProductImageQuery(productId: string, isTemp: boolean) {
    let query: SQL = eq(ProductImageTable.id, productId);
    if (isTemp) {
      query = eq(ProductImageTable.tempProductId, productId);
    }
    return query;
  }
}
