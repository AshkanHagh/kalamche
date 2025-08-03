import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/drizzle/types";
import { IProductLikeRepo } from "../interfaces/IProductLikeRepo";
import { DATABASE } from "src/drizzle/constants";
import { and, eq } from "drizzle-orm";
import { IProductLikeInsertForm, ProductLikeTable } from "src/drizzle/schemas";

@Injectable()
export class ProductLikeRepository implements IProductLikeRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async exists(userId: string, productId: string): Promise<boolean> {
    const [result] = await this.db
      .select()
      .from(ProductLikeTable)
      .where(
        and(
          eq(ProductLikeTable.userId, userId),
          eq(ProductLikeTable.productId, productId),
        ),
      );

    return !!result;
  }

  async insert(form: IProductLikeInsertForm): Promise<void> {
    await this.db.insert(ProductLikeTable).values(form).execute();
  }

  async delete(userId: string, productId: string): Promise<void> {
    await this.db
      .delete(ProductLikeTable)
      .where(
        and(
          eq(ProductLikeTable.userId, userId),
          eq(ProductLikeTable.productId, productId),
        ),
      )
      .execute();
  }
}
