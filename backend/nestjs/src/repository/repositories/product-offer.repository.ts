import { Inject, Injectable } from "@nestjs/common";
import { IProductOfferRepo } from "../interfaces/IProductOfferRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import {
  IProductOfferInsertForm,
  ProductOfferTable,
} from "src/drizzle/schemas";
import { and, eq, lt } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class ProductOfferRepository implements IProductOfferRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async checkShopOfferExists(shopId: string, productId: string) {
    const [offer] = await this.db
      .select({ id: ProductOfferTable.id })
      .from(ProductOfferTable)
      .where(
        and(
          eq(ProductOfferTable.shopId, shopId),
          eq(ProductOfferTable.productId, productId),
        ),
      );

    return !!offer;
  }

  async insert(tx: Database, form: IProductOfferInsertForm) {
    const [offer] = await tx.insert(ProductOfferTable).values(form).returning();

    return offer;
  }

  async findByProductId(productId: string) {
    const [offers] = await this.db
      .select()
      .from(ProductOfferTable)
      .where(eq(ProductOfferTable.productId, productId));
    if (!offers) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return offers;
  }

  async byboxWinner(
    tx: Database,
    productId: string,
    finalPrice: number,
  ): Promise<boolean> {
    const [offer] = await tx
      .select()
      .from(ProductOfferTable)
      .where(
        and(
          eq(ProductOfferTable.productId, productId),
          lt(ProductOfferTable.finalPrice, finalPrice),
        ),
      )
      .limit(1);

    if (offer) {
      return false;
    } else {
      // remove the by box winner from any offer with that product id
      await this.db
        .update(ProductOfferTable)
        .set({ byboxWinner: false })
        .where(eq(ProductOfferTable.productId, productId));
      return true;
    }
  }
}
