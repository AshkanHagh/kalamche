import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { asc, eq, ne, SQL, sql } from "drizzle-orm";
import { IProductRepo } from "../interfaces/IProductRepo";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import {
  IProduct,
  IProductInsertForm,
  ProductImageTable,
  ProductLikeTable,
  ProductOfferTable,
  ProductTable,
  ShopTable,
  ShopViewTable,
} from "src/drizzle/schemas";
import { SearchPayload } from "src/features/product/dto";

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

  async findByAdvanceFilter(params: SearchPayload) {
    const sortOptions: Record<typeof params.sort, SQL> = {
      cheapest: sql`p.initial_price ASC`,
      expensive: sql`p.initial_price DESC`,
      newest: sql`p.created_at DESC`,
      popular: sql`like_count DESC, ts_rank(p.vector, plainto_tsquery('english', ${params.q})) DESC`,
      view: sql`view_count DESC, ts_rank(p.vector, plainto_tsquery('english', ${params.q})) DESC`,
      relevent: sql`ts_rank(p.vector, plainto_tsquery('english', ${params.q})) DESC`,
    };
    const sortQuery = sortOptions[params.sort];

    let priceRangeQuery = sql``;
    if (params.prMax && params.prMin) {
      priceRangeQuery = sql`AND (
        SELECT po.final_price
        FROM ${ProductOfferTable} po
        WHERE po.product_id = p.id AND po.bybox_winner = true
        LIMIT 1
      ) BETWEEN ${params.prMin} AND ${params.prMax}`;
    }

    const query = sql`
      SELECT
        p.*,
        -- Winning offer with shop details
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

        -- thumbnail image
        (
          SELECT pi.url
          FROM ${ProductImageTable} pi
          WHERE pi.product_id = p.id AND pi.is_thumbnail = true
          LIMIT 1
        ) as thumbnail,

        -- View count
        (SELECT COUNT(*) FROM ${ShopViewTable} sv WHERE sv.product_id = p.id) as view_count,
        -- Like count
        (SELECT COUNT(*) FROM ${ProductLikeTable} pl WHERE pl.product_id = p.id) as like_count

      FROM ${ProductTable} p
      WHERE
        p.status = 'public'
        AND p.vector @@ plainto_tsquery('english', ${params.q})
        ${params.brand ? sql`AND LOWER(p.brand) = LOWER(${params.brand})` : sql``}
        ${priceRangeQuery}

      GROUP BY p.id
      ORDER BY ${sortQuery}
      -- Fetch one extra product to check for more results
      LIMIT ${params.limit + 1}
      OFFSET ${params.offset}
    `;

    const result = await this.db.execute(query);
    return result.rows;
  }

  async findPriceRange(q: string) {
    const query = sql`
      SELECT
        MIN(winning_price.final_price) as min_price,
        MAX(winning_price.final_price) as max_price
      FROM ${ProductTable} p
      INNER JOIN (
        SELECT po.product_id, po.final_price
        FROM ${ProductOfferTable} po
        WHERE po.bybox_winner = true
      ) winning_price ON winning_price.product_id = p.id
      WHERE
        p.status = 'public'
        AND p.vector @@ plainto_tsquery('english', ${q})
    `;

    const result = await this.db.execute(query);
    return result.rows;
  }
}
