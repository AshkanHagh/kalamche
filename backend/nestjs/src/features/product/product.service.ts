import { Inject, Injectable } from "@nestjs/common";
import { IProductService } from "./interfaces/IService";
import {
  CompleteProductCreationPayload,
  CreateOfferPayload,
  CreateProductPayload,
  GetproductsByCategoryPayload,
  PaginationPayload,
  RedirectToProductPagePayload,
  SearchPayload,
} from "./dto";
import { ProductRepository } from "src/repository/repositories/product.repository";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { TempProductRepository } from "src/repository/repositories/temp-product.repository";
import { ProductUtilService } from "./util.service";
import { Database } from "src/drizzle/types";
import { ShopRepository } from "src/repository/repositories/shop.repository";
import { ProductOfferRepository } from "src/repository/repositories/product-offer.repository";
import { ProductImageRepository } from "src/repository/repositories/product-image.repository";
import { DATABASE } from "src/drizzle/constants";
import { S3Service } from "./services/s3.service";
import { WalletRepository } from "src/repository/repositories/wallet.repository";
import { MIN_TOKEN_FOR_PRODUCT_CREATION } from "./constants";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Request } from "express";
import { IProductRecord, IProductView } from "src/drizzle/schemas";
import { ProductLikeRepository } from "src/repository/repositories/product-like.repository";
import { CategoryRepository } from "src/repository/repositories/category.repository";
import { BrandRepository } from "src/repository/repositories/brand.repository";

@Injectable()
export class ProductService implements IProductService {
  private OFFER_REDIRECT_PAGE_BASE_URL = `${process.env.BASE_URL}/products/redirect-offer-page`;

  constructor(
    @Inject(DATABASE) private db: Database,
    private productRepository: ProductRepository,
    private tempProductRepository: TempProductRepository,
    private productUtilService: ProductUtilService,
    private shopRepository: ShopRepository,
    private productOfferRepository: ProductOfferRepository,
    private productImageRepository: ProductImageRepository,
    private walletRepository: WalletRepository,
    private productLikeRepository: ProductLikeRepository,
    private categoryRepository: CategoryRepository,
    private brandRepository: BrandRepository,
    private s3Service: S3Service,
    private httpService: HttpService,
  ) {}

  async createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductPayload,
  ) {
    const product = await this.productRepository.findByUpc(payload.upc);
    if (product) {
      throw new KalamcheError(KalamcheErrorType.ProductWithUpcAlreadyExists);
    }
    await this.productUtilService.userHasPermission(userId, shopId);

    const wallet = await this.walletRepository.findByUserId(userId);
    if (wallet.tokens < MIN_TOKEN_FOR_PRODUCT_CREATION) {
      throw new KalamcheError(KalamcheErrorType.NotEnoughTokens);
    }

    // validate upc in production if GO_UPC_API_TOKEN is set
    if (process.env.NODE_ENV === "production" && process.env.GO_UPC_API_TOKEN) {
      try {
        await firstValueFrom(
          this.httpService.get(
            `https://go-upc.com/api/v1/code/${payload.upc}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.GO_UPC_API_TOKEN}`,
              },
            },
          ),
        );
      } catch (error) {
        throw new KalamcheError(KalamcheErrorType.InvalidUpc, error);
      }
    }

    return await this.tempProductRepository.insert({
      shopId,
      upc: payload.upc,
    });
  }

  async completeProductCreation(
    userId: string,
    productId: string,
    payload: CompleteProductCreationPayload,
  ) {
    const tempProduct = await this.tempProductRepository.findById(productId);
    await this.productUtilService.userHasPermission(userId, tempProduct.shopId);

    // Check if brand and category exist; throw error if either is not found
    await Promise.all([
      this.brandRepository.exists(payload.brandId),
      this.categoryRepository.exists(payload.categoryId),
    ]);

    const wallet = await this.walletRepository.findByUserId(userId);
    if (wallet.tokens < MIN_TOKEN_FOR_PRODUCT_CREATION) {
      throw new KalamcheError(KalamcheErrorType.NotEnoughTokens);
    }

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let asin = characters.charAt(Math.floor(Math.random() * 26));
    for (let i = 0; i < 9; i++) {
      asin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const imageUpdateTasks: Promise<void>[] = [];
    const result = await this.db.transaction(async (tx) => {
      await this.walletRepository.consumeTokens(
        tx,
        userId,
        MIN_TOKEN_FOR_PRODUCT_CREATION,
      );

      const product = await this.productRepository.insert(tx, {
        ...payload,
        id: tempProduct.id,
        asin,
        upc: tempProduct.upc,
        shopId: tempProduct.shopId,
        status: "public",
      });

      const uploadedImages =
        await this.productImageRepository.findManyByTempProductId(
          tx,
          tempProduct.id,
        );
      uploadedImages.map((image) => {
        imageUpdateTasks.push(
          this.s3Service.updateObjectTag(image.id, "temp", "false"),
        );
      });

      const redirectPageUrl = `${this.OFFER_REDIRECT_PAGE_BASE_URL}/${product.shopId}/${product.id}`;
      const byboxWinner = await this.productOfferRepository.isByboxWinner(
        tx,
        productId,
        payload.finalPrice,
      );

      await Promise.all([
        this.productOfferRepository.insert(tx, {
          redirectPageUrl,
          finalPrice: payload.finalPrice,
          pageUrl: payload.websiteUrl,
          productId: product.id,
          shopId: product.shopId!,
          title: payload.title,
          status: "active",
          byboxWinner,
        }),
        this.productImageRepository.updateByTempProductId(tx, product.id, {
          tempProductId: null,
          productId: product.id,
        }),
      ]);

      await this.tempProductRepository.delete(tx, productId);

      return product;
    });

    await Promise.all(imageUpdateTasks);
    return result;
  }

  async createOffer(
    userId: string,
    productId: string,
    payload: CreateOfferPayload,
  ) {
    await this.productRepository.exists(productId);

    const userShop = await this.shopRepository.findByUserId(userId);
    if (!userShop) {
      throw new KalamcheError(KalamcheErrorType.UserHasNoShop);
    }

    const wallet = await this.walletRepository.findByUserId(userId);
    if (wallet.tokens < MIN_TOKEN_FOR_PRODUCT_CREATION) {
      throw new KalamcheError(KalamcheErrorType.NotEnoughTokens);
    }

    const hasOffer = await this.productOfferRepository.checkShopOfferExists(
      userShop.id,
      productId,
    );
    if (hasOffer) {
      throw new KalamcheError(KalamcheErrorType.OfferAlreadyExists);
    }

    return await this.db.transaction(async (tx) => {
      await this.walletRepository.consumeTokens(
        tx,
        userId,
        MIN_TOKEN_FOR_PRODUCT_CREATION,
      );

      const redirectPageUrl = `${this.OFFER_REDIRECT_PAGE_BASE_URL}/${userShop.id}/${productId}`;
      const byboxWinner = await this.productOfferRepository.isByboxWinner(
        tx,
        productId,
        payload.finalPrice,
      );

      return await this.productOfferRepository.insert(tx, {
        ...payload,
        redirectPageUrl,
        productId,
        status: "active",
        shopId: userShop.id,
        byboxWinner,
      });
    });
  }

  async uploadImages(
    userId: string,
    productId: string,
    isTemp: boolean,
    files: {
      thumbnailImage?: Express.Multer.File;
      images: Express.Multer.File[];
    },
  ) {
    // Regular images limit
    const MAX_IMAGES = 5;
    // Check for user uploaded images limit
    const [existingThumbnail, totalExistingImages] = await Promise.all([
      this.productImageRepository.isThumbnailExists(productId, isTemp),
      this.productImageRepository.countTotal(productId, isTemp),
    ]);
    if (existingThumbnail && files.thumbnailImage) {
      throw new KalamcheError(KalamcheErrorType.ImageLimitExceeded);
    }
    if (totalExistingImages + files.images.length > MAX_IMAGES) {
      throw new KalamcheError(KalamcheErrorType.ImageLimitExceeded);
    }

    const repository = isTemp
      ? this.tempProductRepository
      : this.productRepository;
    const product = await repository.findById(productId);

    await this.productUtilService.userHasPermission(userId, product.shopId);

    return this.db.transaction(async (tx) => {
      const uploadTasks: Promise<void>[] = [];

      if (files.thumbnailImage) {
        uploadTasks.push(
          this.productUtilService.processImageUpload(
            files.thumbnailImage,
            true,
            productId,
            isTemp,
            tx,
          ),
        );
      }

      uploadTasks.push(
        ...files.images.map((file) =>
          this.productUtilService.processImageUpload(
            file,
            false,
            productId,
            isTemp,
            tx,
          ),
        ),
      );

      await Promise.all(uploadTasks);
    });
  }

  async redirectToProductPage(
    req: Request,
    params: RedirectToProductPagePayload,
  ): Promise<string> {
    let ip = req.headers["x-forwarded-for"] as string | undefined;
    if (ip) {
      ip = ip.split(",")[0].trim();
    } else {
      ip = req.connection?.remoteAddress || req.socket?.remoteAddress || "";
    }

    const userAgent = req.headers["user-agent"] as string;

    const [shop, offer] = await Promise.all([
      this.shopRepository.findById(params.shopId),
      this.productOfferRepository.findByProductId(params.productId),
      this.productRepository.exists(params.productId),
    ]);

    await this.productUtilService.handleTokenCharging(
      shop.userId,
      params.shopId,
      params.productId,
      ip,
      userAgent,
    );

    return offer.pageUrl;
  }

  async getProduct(productId: string): Promise<IProductView> {
    const result = await this.productRepository.findProductView(productId);
    if (!result) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const { offers, likes, views, priceHistory, ...product } = result;
    const productView: IProductView = {
      ...product,
      offers,
      views: views.length,
      likes: likes.length,
      priceHistory,
    };

    return productView;
  }

  async getSimilarProduct(
    productId: string,
    params: PaginationPayload,
  ): Promise<IProductRecord[]> {
    const product = await this.productRepository.findById(productId);
    const result = await this.productRepository.findSimilarProducts(
      product,
      params.limit,
      params.offset,
    );

    const productRecord: IProductRecord[] = result.map(
      ({ images, offers, ...product }) => ({
        imageUrl: images[0]?.url || "",
        price: offers[0]?.finalPrice || 0,
        ...product,
      }),
    );
    return productRecord;
  }

  async toggleLike(userId: string, productId: string): Promise<void> {
    await this.productRepository.exists(productId);

    const liked = await this.productLikeRepository.exists(userId, productId);
    if (liked) {
      await this.productLikeRepository.delete(userId, productId);
    } else {
      await this.productLikeRepository.insert({
        userId,
        productId,
      });
    }
  }

  async search(params: SearchPayload) {
    const result = await this.productRepository.findByFilters(
      { q: params.q },
      params,
    );
    if (result.length === 0) {
      return {
        products: [],
        hasNext: false,
      };
    }

    const [priceRangeResult, similarBrands] = await Promise.all([
      this.productRepository.findPriceRange(params.q),
      this.brandRepository.findSimilarBrands({ q: params.q }, 5),
    ]);

    // Check for next page by fetching one extra product beyond the limit
    const hasNext = result.length > params.limit;
    if (hasNext) {
      // Remove the extra product
      result.pop();
    }

    return {
      products: result,
      priceRange: {
        min: priceRangeResult.minPrice,
        max: priceRangeResult.maxPrice,
      },
      similarBrands,
      hasNext,
    };
  }

  async getProductsByCategory(params: GetproductsByCategoryPayload) {
    const notFoundResult = {
      products: [],
      hasNext: false,
    };

    const category = await this.categoryRepository.findBySlug(params.category);
    if (!category) {
      return notFoundResult;
    }
    const result = await this.productRepository.findByFilters(
      { categoryId: category.id },
      params,
    );
    if (result.length === 0) {
      return notFoundResult;
    }

    const [priceRangeResult, similarBrands, similarCategories] =
      await Promise.all([
        this.productRepository.findPriceRange(params.category),
        this.brandRepository.findSimilarBrands({ categoryId: category.id }, 5),
        this.categoryRepository.findHierarchy(category.path),
      ]);

    // Check for next page by fetching one extra product beyond the limit
    const hasNext = result.length > params.limit;
    if (hasNext) {
      // Remove the extra product
      result.pop();
    }

    return {
      products: result,
      priceRange: {
        min: priceRangeResult.minPrice,
        max: priceRangeResult.maxPrice,
      },
      similarBrands,
      similarCategories,
      hasNext,
    };
  }
}
