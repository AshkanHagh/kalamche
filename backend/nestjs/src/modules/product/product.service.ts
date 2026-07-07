import { Inject, Injectable } from "@nestjs/common";
import {
  CreateOfferDto,
  CreateProductDto,
  PaginationDto,
  SearchDto,
} from "./dto";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ProductUtilService } from "./util.service";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import {
  BrandTable,
  CategoryTable,
  ProductImageTable,
  ProductLikeTable,
  ProductOfferTable,
  ProductPriceHistoryTable,
  ProductTable,
  ShopTable,
} from "src/drizzle/schemas";
import ky from "ky";
import { and, gte } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { generateAsin } from "src/utils/asin";
import {
  MeilisearchService,
  ProductSearchDocument,
} from "./services/meilisearch.service";
import { S3Service } from "../attachment/services/s3.service";

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
    private utilService: ProductUtilService,
    private searchService: MeilisearchService,
  ) {}

  private async checkUserPermission(userId: string) {
    const shop = await this.db.query.ShopTable.findFirst({
      where: eq(ShopTable.userId, userId),
    });
    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    return shop;
  }

  async createProduct(userId: string, payload: CreateProductDto) {
    const shop = await this.checkUserPermission(userId);

    await this.db.transaction(async (tx) => {
      const [product] = await tx
        .select()
        .from(ProductTable)
        .where(eq(ProductTable.upc, payload.upc))
        .for("update");
      if (product) {
        throw new KalamcheError(KalamcheErrorType.ProductWithUpcAlreadyExists);
      }
    });
    // validate upc in production if GO_UPC_API_TOKEN is set
    if (process.env.NODE_ENV === "production" && process.env.GO_UPC_API_TOKEN) {
      try {
        await ky
          .get(`https://go-upc.com/api/v1/code/${payload.upc}`, {
            headers: {
              Authorization: `Bearer ${process.env.GO_UPC_API_TOKEN}`,
            },
          })
          .json();
      } catch (error) {
        throw new KalamcheError(KalamcheErrorType.InvalidUpc, error);
      }
    }
    // Check if brand and category exist; throw error if either is not found
    const [brand, category] = await Promise.all([
      this.db.query.BrandTable.findFirst({
        where: eq(BrandTable.id, payload.brandId),
      }),
      this.db.query.CategoryTable.findFirst({
        where: eq(CategoryTable.id, payload.categoryId),
      }),
    ]);
    if (!brand || !category) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return await this.db.transaction(async (tx) => {
      const [product] = await tx
        .insert(ProductTable)
        .values({
          ...payload,
          asin: generateAsin(),
          shopId: shop.id,
          status: "public",
        })
        .returning();
      await Promise.all([
        this.utilService.setProductImages(tx, payload.imageIds, product.id),
        this.utilService.createProductOffer(tx, product.id, shop.id, payload),
      ]);
      return product;
    });
  }

  async createOffer(
    userId: string,
    productId: string,
    payload: CreateOfferDto,
  ) {
    const shop = await this.checkUserPermission(userId);
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return await this.db.transaction(async (tx) => {
      const [hasOffer] = await this.db
        .select()
        .from(ProductOfferTable)
        .where(
          and(
            eq(ProductOfferTable.shopId, shop.id),
            eq(ProductOfferTable.productId, productId),
          ),
        )
        .for("update");
      if (hasOffer) {
        throw new KalamcheError(KalamcheErrorType.OfferAlreadyExists);
      }
      return await this.utilService.createProductOffer(
        tx,
        productId,
        shop.id,
        payload,
      );
    });
  }

  async getProduct(productId: string) {
    // date filter for product price history(default is from 6m-present)
    const sixMountsAgo = new Date();
    sixMountsAgo.setMonth(sixMountsAgo.getMonth() - 6);

    const products = await this.db.query.ProductTable.findFirst({
      where: and(
        eq(ProductTable.id, productId),
        eq(ProductTable.status, "public"),
      ),
      with: {
        offers: {
          where: eq(ProductOfferTable.status, "active"),
          with: {
            shop: true,
          },
          columns: {
            pageUrl: false,
          },
        },
        views: {
          columns: {
            id: true,
          },
        },
        likes: {
          columns: {
            productId: true,
          },
        },
        priceHistory: {
          where: gte(ProductPriceHistoryTable.createdAt, sixMountsAgo),
          limit: 6,
        },
        category: true,
        brand: true,
      },
      columns: {
        initialPrice: false,
      },
    });

    if (!products) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    const { offers, likes, views, priceHistory, ...product } = products;
    return {
      ...product,
      offers,
      views: views.length,
      likes: likes.length,
      priceHistory,
    };
  }

  async getSimilarProduct(productId: string, params: PaginationDto) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
      with: {
        brand: true,
        offers: {
          where: eq(ProductOfferTable.byboxWinner, true),
        },
      },
    });
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const price = product.offers[0].finalPrice;
    const minPrice = price * 0.7;
    const maxPrice = price * 1.3;
    const baseFilter = [
      'status = "public"',
      `id != ${product.id}`,
      `categoryId = "${product.categoryId}"`,
      `finalPrice ${minPrice} TO ${maxPrice}`,
    ];

    const result =
      await this.searchService.productIndex.search<ProductSearchDocument>("", {
        filter: [...baseFilter, `brandName = "${product.brand.name}"`],
        limit: params.limit + 1,
        offset: params.offset,
      });
    const nA = result.estimatedTotalHits;
    let products = result.hits;

    const fallbackCountNeeded = params.limit - products.length;
    if (fallbackCountNeeded > 0) {
      const result =
        await this.searchService.productIndex.search<ProductSearchDocument>(
          "",
          {
            filter: [...baseFilter, `brandName != "${product.brand.name}"`],
            limit: fallbackCountNeeded + 1,
            offset: Math.max(0, params.offset - nA),
          },
        );
      products = result.hits;
    }

    // Check for next page by fetching one extra product beyond the limit
    const hasNext = products.length > params.limit;
    if (hasNext) {
      // Remove the extra product
      products.pop();
    }
    return {
      hasNext,
      products,
    };
  }

  async toggleLike(userId: string, productId: string) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    await this.db.transaction(async (tx) => {
      const liked = await tx
        .select()
        .from(ProductLikeTable)
        .where(
          and(
            eq(ProductLikeTable.userId, userId),
            eq(ProductLikeTable.productId, productId),
          ),
        )
        .for("update");
      if (liked) {
        await tx
          .delete(ProductLikeTable)
          .where(
            and(
              eq(ProductLikeTable.userId, userId),
              eq(ProductLikeTable.productId, productId),
            ),
          );
      } else {
        await tx.insert(ProductLikeTable).values({
          userId,
          productId,
        });
      }
    });
  }

  async search(params: SearchDto) {
    const sortMap: Record<string, string[] | undefined> = {
      cheapest: ["initialPrice:asc"],
      expensive: ["initialPrice:desc"],
      newest: ["createdAt:desc"],
      popular: ["likeCount:desc"],
      view: ["viewCount:desc"],
      // IGNORE: meilisearch always return relevent products,
      // this was used for postgres(has no use here)
      relevent: undefined,
    };
    const filters: string[] = ['status = "public"'];

    if (params.prMax && params.prMin) {
      filters.push(`finalPrice ${params.prMin} TO ${params.prMax}`);
    } else if (params.category) {
      // set categoryId filter only when brand is valid
      const category = await this.db.query.CategoryTable.findFirst({
        where: eq(CategoryTable.slug, params.category),
      });
      if (category) {
        filters.push(`categoryId = "${category.id}"`);
      }
    } else if (params.brand) {
      const brand = await this.db.query.BrandTable.findFirst({
        where: eq(BrandTable.slug, params.brand),
      });
      // set brand name filter only when brand is valid
      if (brand) {
        filters.push(`brandName = "${params.brand}"`);
      }
    }

    const products = await this.searchService.productIndex.search(params.q, {
      filter: filters,
      sort: sortMap[params.sort],
      facets: ["brandName", "finalPrice"],
      limit: params.limit + 1,
      offset: params.offset,
    });

    if (products.hits.length === 0) {
      return {
        products: [],
        hasNext: false,
      };
    }
    // Check for next page by fetching one extra product beyond the limit
    const hasNext = products.hits.length > params.limit;
    if (hasNext) {
      // Remove the extra product
      products.hits.pop();
    }
    return {
      products: products.hits,
      priceRange: {
        min: products.facetStats?.finalPrice.min,
        max: products.facetStats?.finalPrice.max,
      },
      // OPTIONAL: if the result is not good(is good)
      // we should refactor brand schema to connect with category
      // this way we can query all brands from this category that user is serached
      similarBrands: Object.keys(products.facetDistribution?.brandName || {}),
      hasNext,
    };
  }

  async deleteProduct(userId: string, productId: string) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    const shop = await this.checkUserPermission(userId);

    await this.db.transaction(async (tx) => {
      await tx
        .delete(ProductOfferTable)
        .where(
          and(
            eq(ProductOfferTable.productId, product.id),
            eq(ProductOfferTable.shopId, shop.id),
          ),
        );
      // remove the access to product
      await tx
        .update(ProductTable)
        .set({
          shopId: null,
        })
        .where(eq(ProductTable.id, product.id));

      const deletedImages = await tx
        .delete(ProductImageTable)
        .where(eq(ProductImageTable.productId, product.id))
        .returning();
      await Promise.all(
        deletedImages.map(async (image) => {
          await this.s3Service.delete(image.id);
        }),
      );
    });
  }

  async getCategories() {
    return await this.db.query.CategoryTable.findMany();
  }

  async getBrands() {
    return await this.db.query.BrandTable.findMany();
  }
}
