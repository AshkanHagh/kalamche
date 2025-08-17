import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { and, asc, eq, max, min, ne, SQL, sql } from "drizzle-orm";
import { IProductRepo } from "../interfaces/IProductRepo";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  BrandTable,
  IProduct,
  IProductInsertForm,
  IProductUpdateForm,
  ProductImageTable,
  ProductLikeTable,
  ProductOfferTable,
  ProductTable,
  ShopTable,
  ShopViewTable,
} from "src/drizzle/schemas";
import { FilterOptions } from "src/features/product/dto";

export class ProductRepository implements IProductRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findByUpc(upc: string): Promise<IProduct | undefined> {
    const [product] = await this.db
      .select()
      .from(ProductTable)
      .where(eq(ProductTable.upc, upc));
    return product;
  }

  async findById(id: string): Promise<IProduct> {
    const [product] = await this.db
      .select()
      .from(ProductTable)
      .where(eq(ProductTable.id, id));
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return product;
  }

  async insert(tx: Database, form: IProductInsertForm): Promise<IProduct> {
    const [product] = await tx.insert(ProductTable).values(form).returning();
    return product;
  }

  async exists(id: string): Promise<void> {
    const [productId] = await this.db
      .select({ id: ProductTable.id })
      .from(ProductTable)
      .where(eq(ProductTable.id, id));

    if (!productId) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
  }

  // TODO: Make relations optional in function params so users can choose which to include
  async findProductView(id: string) {
    const sixMountsAgo = new Date();
    sixMountsAgo.setMonth(sixMountsAgo.getMonth() - 6);

    return await this.db.query.ProductTable.findFirst({
      where: (table, funcs) =>
        funcs.and(funcs.eq(table.id, id), funcs.eq(table.status, "public")),
      with: {
        offers: {
          where: (table, funcs) => funcs.eq(table.status, "active"),
          with: {
            shop: true,
          },
          columns: {
            pageUrl: false,
          },
        },
        views: true,
        likes: true,
        priceHistory: {
          where: (table, funcs) => funcs.gte(table.createdAt, sixMountsAgo),
          limit: 6,
        },
        category: true,
        brand: true,
      },
      columns: {
        vector: false,
        initialPrice: false,
      },
    });
  }

  async findSimilarProducts(product: IProduct, limit: number, offset: number) {
    const searchTerms = [product.title, product.description]
      .filter(Boolean) // remove empty values
      .join(" ")
      .replace(/[^\w\s]/g, " ") // remove special characters
      .split(/\s+/) // split into words
      .filter((word) => word.length > 2) // remove short words
      .slice(0, 10) // limit to first 10 words to avoid query complexity
      .join(" | "); // use OR operator for broader matching

    if (!searchTerms) {
      return [];
    }

    return await this.db.query.ProductTable.findMany({
      where: (table, funcs) =>
        funcs.and(
          sql`${table.vector} @@ to_tsquery('english', ${searchTerms})`,
          ne(table.id, product.id),
          eq(table.status, "public"),
        ),
      with: {
        images: {
          where: (table, funcs) => funcs.eq(table.isThumbnail, true),
        },
        offers: {
          where: (table, funcs) => funcs.eq(table.byboxWinner, true),
        },
      },
      columns: {
        initialPrice: false,
        vector: false,
      },
      orderBy: [
        sql`
          ts_rank(${ProductTable.vector}, to_tsquery('english', ${searchTerms})) DESC
        `,
        asc(ProductTable.initialPrice),
      ],
      limit: limit + 1,
      offset,
    });
  }

  async findByShopId(shopId: string, limit: number, offset: number) {
    return await this.db.query.ProductTable.findMany({
      where: (table, funcs) => funcs.and(funcs.eq(table.shopId, shopId)),
      with: {
        images: {
          where: (table, funcs) => funcs.eq(table.isThumbnail, true),
        },
        offers: {
          where: (table, funcs) => funcs.eq(table.shopId, shopId),
        },
      },
      columns: {
        vector: false,
        initialPrice: false,
      },
      limit: limit + 1,
      offset,
    });
  }

  async findWithShop(shopId: string, id: string) {
    return await this.db.query.ProductTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, id),
      with: {
        offers: {
          where: (table, funcs) => funcs.eq(table.shopId, shopId),
        },
        images: true,
      },
    });
  }

  // TODO: the query in both category and search are the same
  async findByFilters(
    query: Partial<{ categoryId: string; q: string }>,
    filters: FilterOptions,
  ) {
    // brand filter and ranking boost if brand is provided
    const brandCondition = filters.brand
      ? sql`AND LOWER(b.name) = LOWER(${filters.brand})`
      : sql``;
    // match brand name (case-insensitive) and increase ranking score
    const brandBoost = filters.brand ? sql`0.5` : sql`0`;

    // Calculate search ranking based on text match and brand boost
    const finalRank = query.categoryId
      ? null
      : sql`ts_rank(p.vector, plainto_tsquery('english', ${query.q})) + ${brandBoost}`;

    const sortOptions: Record<typeof filters.sort, SQL | null> = {
      cheapest: sql`p.initial_price ASC`,
      expensive: sql`p.initial_price DESC`,
      newest: sql`p.created_at DESC`,
      popular: finalRank
        ? sql`like_count DESC, ${finalRank} DESC`
        : sql`like_count DESC`,
      view: finalRank
        ? sql`view_count DESC, ${finalRank} DESC`
        : sql`view_count DESC`,
      relevent: finalRank ? sql`${finalRank} DESC` : null,
    };
    const sortQuery = finalRank
      ? sql`ORDER BY ${sortOptions[filters.sort]}`
      : sql``;

    // Add price range filter if both min and max prices are provided
    let priceRangeQuery = sql``;
    if (filters.prMax && filters.prMin) {
      // Filter products where the winning offer price is between min and max
      priceRangeQuery = sql`AND (
        SELECT po.final_price
        FROM ${ProductOfferTable} po
        WHERE po.product_id = p.id AND po.bybox_winner = true
        LIMIT 1
      ) BETWEEN ${filters.prMin} AND ${filters.prMax}`;
    }

    const sqlQuery = sql`
      SELECT
        p.*,
        (
          SELECT JSON_BUILD_OBJECT(
            'offer', row_to_json(po.*),
            'shop', row_to_json(s.*)
          )
          FROM ${ProductOfferTable} po
          LEFT JOIN ${ShopTable} s ON s.id = po.shop_id
          WHERE po.product_id = p.id AND po.bybox_winner = true
          LIMIT 1
        ) as winning_offer,

        (
          SELECT pi.url
          FROM ${ProductImageTable} pi
          WHERE pi.product_id = p.id AND pi.is_thumbnail = true
          LIMIT 1
        ) as thumbnail,

        (SELECT COUNT(*) FROM ${ShopViewTable} sv WHERE sv.product_id = p.id) as view_count,
        (SELECT COUNT(*) FROM ${ProductLikeTable} pl WHERE pl.product_id = p.id) as like_count

      FROM ${ProductTable} p
      INNER JOIN ${BrandTable} b ON b.id = p.brand_id

      WHERE
        p.status = 'public'
        AND ${query.categoryId ? sql`p.category_id = ${query.categoryId}` : sql`p.vector @@ plainto_tsquery('english', ${query.q})`}
        ${brandCondition}
        ${priceRangeQuery}

      GROUP BY p.id
      ${sortQuery}
      -- Fetch one extra product to check for more results
      LIMIT ${filters.limit + 1}
      OFFSET ${filters.offset}
    `;

    const result = await this.db.execute(sqlQuery);
    return result.rows;
  }

  async findPriceRange(q: string) {
    const subquery = this.db
      .select()
      .from(ProductOfferTable)
      .where(eq(ProductOfferTable.byboxWinner, true))
      .as("po");

    const [range] = await this.db
      .select({
        minPrice: min(subquery.finalPrice),
        maxPrice: max(subquery.finalPrice),
      })
      .from(ProductTable)
      .innerJoinLateral(subquery, sql`po.product_id = ${ProductTable.id}`)
      .where(
        and(
          eq(ProductTable.status, "public"),
          sql`${ProductTable.vector} @@ plainto_tsquery('english', ${q})`,
        ),
      );

    return range;
  }

  async update(tx: Database, id: string, form: IProductUpdateForm) {
    return (
      await tx
        .update(ProductTable)
        .set(form)
        .where(eq(ProductTable.id, id))
        .returning()
    )[0];
  }
}
