import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import {
  Database,
  IProduct,
  IProductInsertForm,
  IProductView,
} from "src/drizzle/types";
import { eq } from "drizzle-orm";
import { IProductRepo } from "../interfaces/IProductRepo";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ProductTable } from "src/drizzle/schemas";

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

  async insert(form: IProductInsertForm): Promise<IProduct> {
    const [product] = await this.db
      .insert(ProductTable)
      .values(form)
      .returning();
    return product;
  }

  async findProductViewByUpc(upc: string): Promise<IProductView | undefined> {
    const result = await this.db.query.ProductTable.findFirst({
      where: (table, funcs) => funcs.eq(table.upc, upc),
      columns: {
        vector: false,
      },
      with: {
        shop: true,
      },
    });

    return result;
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

  // async findProductsByFilter(
  //   sort: "cheapest" | "view" | "newest" | "expensive" | "popular",
  //   brand: string,
  //   search: string,
  //   prMax: number,
  //   prMin: number,
  //   limit: number,
  //   offset: number,
  // ) {
  //   // TODO: the expensive most return the expensive products not the highest price of the product
  //   // TODO: for popular check on 0 like result
  //   // TODO: min max is wrong it dose not update on filters
  //   const sortOptions: Record<typeof sort, SQL> = {
  //     cheapest: asc(ProductOfferTable.finalPrice),
  //     expensive: desc(ProductOfferTable.finalPrice),
  //     newest: desc(ProductTable.createdAt),
  //     view: desc(ProductTable.views),
  //     popular: desc(sql`like_count`),
  //   };
  //   // default shop offers sort set to cheapest for other sort options
  //   const sortBy =
  //     sort !== "cheapest" ? sortOptions[sort] : sortOptions["cheapest"];

  //   const searchQuery = sql`
  //     ${ProductTable.vector} @@ to_tsquery('english', ${search})
  //   `;
  //   const rankSort = sql`
  //     ts_rank(${ProductTable.vector}, to_tsquery('english', ${search})) DESC
  //   `;
  //   const minPriceQuery = sql<number>`
  //     MIN(${ProductOfferTable.price}) OVER (PARTITION BY ${ProductTable.id})
  //   `.as("minPrice");
  //   const maxPriceQuery = sql<number>`
  //     MAX(${ProductOfferTable.price}) OVER (PARTITION BY ${ProductTable.id})
  //   `.as("maxPrice");
  //   const likeCountQuery = sql<number>`
  //     (SELECT COUNT(*) FROM ${ProductLikeTable} WHERE ${ProductLikeTable.productId} = ${ProductTable.id})
  //   `.as("like_count");

  //   const { vector: _, ...productTable } = getTableColumns(ProductTable);
  //   return await this.db
  //     .selectDistinctOn([ProductTable.id], {
  //       product: productTable,
  //       shop: ShopTable,
  //       offer: ProductOfferTable,
  //       image: ProductImageTable,
  //       minPrice: minPriceQuery,
  //       maxPrice: maxPriceQuery,
  //       likeCount: likeCountQuery,
  //     })
  //     .from(ProductTable)
  //     .leftJoin(
  //       ProductOfferTable,
  //       eq(ProductTable.id, ProductOfferTable.productId),
  //     )
  //     .leftJoin(ShopTable, eq(ProductTable.shopId, ShopTable.id))
  //     .leftJoin(
  //       ProductImageTable,
  //       and(
  //         eq(ProductTable.id, ProductImageTable.productId),
  //         eq(ProductImageTable.primary, true),
  //       ),
  //     )
  //     .where(
  //       and(
  //         searchQuery,
  //         and(
  //           eq(ProductTable.status, "public"),
  //           between(ProductOfferTable.price, prMin, prMax),
  //         ),
  //       ),
  //     )
  //     .orderBy(ProductTable.id, sortBy, rankSort)
  //     .limit(limit + 1)
  //     .offset(offset);
  // }
}
