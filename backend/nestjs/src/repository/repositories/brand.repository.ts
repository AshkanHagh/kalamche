import { Inject, Injectable } from "@nestjs/common";
import { IBrandRepo } from "../interfaces/IBrandRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { BrandTable, ProductTable } from "src/drizzle/schemas";
import { and, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class BrandRepository implements IBrandRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async exists(id: string): Promise<void> {
    const [brandId] = await this.db
      .select({ id: BrandTable.id })
      .from(BrandTable)
      .where(eq(BrandTable.id, id));

    if (!brandId) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
  }

  async findSimilarBrands(
    query: Partial<{ categoryId: string; q: string }>,
    limit: number = 5,
  ) {
    const conditionQuery = query.categoryId
      ? eq(ProductTable.categoryId, query.categoryId)
      : sql`${ProductTable.vector} @@ plainto_tsquery('english', ${query.q})`;

    const brands = await this.db
      .select({
        ...getTableColumns(BrandTable),
        productCount: count().as("product_count"),
      })
      .from(ProductTable)
      .innerJoin(BrandTable, eq(BrandTable.id, ProductTable.brandId))
      .where(and(eq(ProductTable.status, "public"), conditionQuery))
      .orderBy(desc(sql`product_count`))
      .groupBy(BrandTable.id, BrandTable.slug, BrandTable.name)
      .limit(limit);

    return brands;
  }
}
