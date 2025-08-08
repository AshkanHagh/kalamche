import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DATABASE } from "src/drizzle/constants";
import {
  IProductPriceHistoryInsertForm,
  ProductPriceHistoryTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

@Injectable()
export class ProductScheduler {
  private logger = new Logger(ProductScheduler.name);

  constructor(@Inject(DATABASE) private db: Database) {}

  // Find the lowest price of active offers for all public products
  // Save the prices to the product history table in the database
  // Runs every month on the 1st day at midnight
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handelPriceHistoryCron() {
    this.logger.log("Price history cron job started");

    // Get all public products with their active offers, sorted by lowest price
    const products = await this.db.query.ProductTable.findMany({
      where: (table, funcs) => funcs.eq(table.status, "public"),
      with: {
        offers: {
          where: (table, funcs) => funcs.eq(table.status, "active"),
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

        // Create records for the lowest price of each product
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
