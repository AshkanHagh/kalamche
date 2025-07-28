import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DATABASE } from "src/drizzle/constants";
import { ProductPriceHistoryTable } from "src/drizzle/schemas";
import { Database, IProductPriceHistoryInsertForm } from "src/drizzle/types";

@Injectable()
export class ProductScheduler {
  private logger = new Logger(ProductScheduler.name);

  constructor(@Inject(DATABASE) private db: Database) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handelPriceHistoryCron() {
    this.logger.log("Price history cron job started");

    const products = await this.db.query.ProductTable.findMany({
      where: (table, funcs) => funcs.eq(table.status, "public"),
      with: {
        offers: {
          orderBy: (table, funcs) => funcs.asc(table.finalPrice),
          columns: { id: true, finalPrice: true },
        },
      },
      columns: {
        id: true,
      },
    });

    const batchSize = 50;
    await this.db.transaction(async (tx) => {
      for (let i = 0; i < products.length; i += batchSize) {
        const records = products.slice(i, i + batchSize);

        const insertForms: IProductPriceHistoryInsertForm[] = records.map(
          (product) => ({
            price: product.offers[0].finalPrice,
            productId: product.id,
          }),
        );

        await tx.insert(ProductPriceHistoryTable).values(insertForms).execute();
      }
    });
  }
}
