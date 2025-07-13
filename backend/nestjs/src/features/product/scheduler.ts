import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { eq } from "drizzle-orm";
import { ProductTable } from "src/drizzle/schemas";
import { ProductPriceHistoryTable } from "src/drizzle/schemas/product-price-history.schema";
import { IProductPriceHistoryInsertForm } from "src/drizzle/types";
import { RepositoryService } from "src/repository/repository.service";

// TODO: update commented code to match new database structure
@Injectable()
export class ProductScheduler {
  constructor(private repo: RepositoryService) {}

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
