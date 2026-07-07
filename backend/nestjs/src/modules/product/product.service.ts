import { Inject, Injectable } from "@nestjs/common";
import { CreateOfferDto, CreateProductDto, SearchDto } from "./dto";
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
import { MeilisearchService } from "./services/meilisearch.service";
import { S3Service } from "../attachment/services/s3.service";
import { count } from "drizzle-orm";

@Injectable()
export class ProductService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
    private productUtilService: ProductUtilService,
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
    if (brand || category) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const product = await this.db.transaction(async (tx) => {
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
        this.productUtilService.setProductImages(
          tx,
          payload.imageIds,
          product.id,
        ),
        this.productUtilService.createProductOffer(
          tx,
          product.id,
          shop.id,
          payload,
        ),
      ]);
      return product;
    });

    // currently we dont have any backup plan for when indexing fails
    await this.searchService.addNewDoc(product.id).catch(() => {});
    return product;
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

    const hasOffer = await this.db.query.ProductOfferTable.findFirst({
      where: and(
        eq(ProductOfferTable.shopId, shop.id),
        eq(ProductOfferTable.productId, productId),
      ),
    });
    if (hasOffer) {
      throw new KalamcheError(KalamcheErrorType.OfferAlreadyExists);
    }

    return await this.db.transaction(async (tx) => {
      return await this.productUtilService.createProductOffer(
        tx,
        productId,
        shop.id,
        payload,
      );
    });
  }

  async getProduct(productId: string) {
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

  // async getSimilarProduct(productId: string, params: PaginationDto) {
  //   const product = await this.productRepository.findById(productId);
  //   const result = await this.productRepository.findSimilarProducts(
  //     product,
  //     params.limit,
  //     params.offset,
  //   );

  //   const productRecord: IProductRecord[] = result.map(
  //     ({ images, offers, ...product }) => ({
  //       imageUrl: images[0]?.url || "",
  //       price: offers[0]?.finalPrice || 0,
  //       ...product,
  //     }),
  //   );
  //   return productRecord;
  // }

  async toggleLike(userId: string, productId: string) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
    });
    if (!product) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const liked = await this.db.query.ProductLikeTable.findFirst({
      where: and(
        eq(ProductLikeTable.userId, userId),
        eq(ProductLikeTable.productId, productId),
      ),
    });
    if (liked) {
      await this.db
        .delete(ProductLikeTable)
        .where(
          and(
            eq(ProductLikeTable.userId, userId),
            eq(ProductLikeTable.productId, productId),
          ),
        );
    } else {
      await this.db.insert(ProductLikeTable).values({
        userId,
        productId,
      });
    }

    const [likes] = await this.db
      .select({ count: count() })
      .from(ProductLikeTable)
      .where(eq(ProductLikeTable.productId, productId));
    await this.searchService.updateDoc(productId, {
      likeCount: likes.count,
    });
  }

  async search(params: SearchDto, categoryId?: string) {
    const sortMap: Record<string, string[] | undefined> = {
      cheapest: ["initialPrice:asc"],
      expensive: ["initialPrice:desc"],
      newest: ["createdAt:desc"],
      popular: ["likeCount:desc"],
      view: ["viewCount:desc"],
      relevent: undefined,
    };
    const filters: string[] = ['status = "public"'];
    if (params.brand) {
      filters.push(`brandName = "${params.brand}"`);
    } else if (params.prMax && params.prMin) {
      filters.push(`finalPrice ${params.prMin} TO ${params.prMax}`);
    } else if (categoryId) {
      filters.push(`categoryId = "${categoryId}"`);
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

  // async getProductsByCategory(slug: string, params: CategorySearchDto) {
  //   const notFoundResult = {
  //     products: [],
  //     hasNext: false,
  //   };
  //   const category = await this.db.query.CategoryTable.findFirst({
  //     where: eq(CategoryTable.slug, slug),
  //   });
  //   if (!category) {
  //     return notFoundResult;
  //   }

  //   const parentCategories = this.categoryRepository.findHierarchy(
  //     category.path,
  //   );

  //   const result = await this.search(
  //     {
  //       ...params,
  //       q: "",
  //     },
  //     category.id,
  //   );

  //   return {
  //     ...result,
  //     parentCategories,
  //   };
  // }

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
}
