import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IProductImageRepo } from "../interfaces/IProductImageRepo";
import {
  IProductImageInsertForm,
  ProductImageTable,
  IProductImageUpdateForm,
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

  async findManyByTempProductId(tx: Database, tempProductId: string) {
    return tx
      .select()
      .from(ProductImageTable)
      .where(
        and(
          eq(ProductImageTable.tempProductId, tempProductId),
          eq(ProductImageTable.isCompleted, true),
        ),
      );
  }

  async updateByTempProductId(
    tx: Database,
    tempProductId: string,
    form: IProductImageUpdateForm,
  ) {
    await tx
      .update(ProductImageTable)
      .set(form)
      .where(eq(ProductImageTable.tempProductId, tempProductId));
  }

  async deleteTemp(tx: Database, productId: string) {
    return await tx
      .delete(ProductImageTable)
      .where(eq(ProductImageTable.tempProductId, productId))
      .returning();
  }

  async delete(tx: Database, productId: string) {
    return await tx
      .delete(ProductImageTable)
      .where(eq(ProductImageTable.productId, productId))
      .returning();
  }

  #buildProductImageQuery(productId: string, isTemp: boolean) {
    let query: SQL = eq(ProductImageTable.id, productId);
    if (isTemp) {
      query = eq(ProductImageTable.tempProductId, productId);
    }
    return query;
  }
}
