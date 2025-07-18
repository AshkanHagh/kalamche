import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

// TODO: update commented code to match new database structure
@Injectable()
export class ProductScheduler {
  constructor() {}

  // get all products and insert price history for each product every day
  // only store last 6 mounts
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handelPriceHistoryCron() {
    // const products = await this.repo
    //   .db()
    //   .select({
    //     id: ProductTable.id,
    //     price: ProductTable.price,
    //   })
    //   .from(ProductTable)
    //   .where(eq(ProductTable.status, "public"));
    // const batchSize = 50;
    // for (let i = 0; i < products.length; i += batchSize) {
    //   const forms: IProductPriceHistoryInsertForm[] = products
    //     .slice(i, i + batchSize)
    //     .map((product) => ({
    //       price: product.price,
    //       productId: product.id,
    //     }));
    //   await this.repo
    //     .db()
    //     .insert(ProductPriceHistoryTable)
    //     .values(forms)
    //     .execute();
    // }
  }
}
