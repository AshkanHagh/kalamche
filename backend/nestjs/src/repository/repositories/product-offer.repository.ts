import { Inject, Injectable } from "@nestjs/common";
import { IProductOfferRepo } from "../interfaces/IProductOfferRepo";
import { DATABASE } from "src/drizzle/constants";
import {
  Database,
  IProductOffer,
  IProductOfferInsertForm,
} from "src/drizzle/types";
import { ProductOfferTable } from "src/drizzle/schemas";
import { and, eq } from "drizzle-orm";

@Injectable()
export class ProductOfferRepository implements IProductOfferRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async checkShopOfferExists(
    shopId: string,
    productId: string,
  ): Promise<boolean> {
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

  async insert(form: IProductOfferInsertForm): Promise<IProductOffer> {
    const [offer] = await this.db
      .insert(ProductOfferTable)
      .values(form)
      .returning();

    return offer;
  }
}
