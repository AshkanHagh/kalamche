import { Inject, Injectable } from "@nestjs/common";
import { IProductService } from "./interfaces/IService";
import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
  PaginationDto,
  RedirectToProductPageDto,
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
import {
  MIN_TOKEN_FOR_PRODUCT_CREATION,
  OFFER_REDIRECT_PAGE_BASE_URL,
} from "./constants";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { Request } from "express";
import { IProductRecord, IProductView } from "src/drizzle/schemas";

@Injectable()
export class ProductService implements IProductService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private productRepository: ProductRepository,
    private tempProductRepository: TempProductRepository,
    private productUtilService: ProductUtilService,
    private shopRepository: ShopRepository,
    private productOfferRepository: ProductOfferRepository,
    private productImageRepository: ProductImageRepository,
    private walletRepository: WalletRepository,
    private s3Service: S3Service,
    private httpService: HttpService,
  ) {}

  async createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductDto,
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
    payload: CompleteProductCreationDto,
  ) {
    const tempProduct = await this.tempProductRepository.findById(productId);
    await this.productUtilService.userHasPermission(userId, tempProduct.shopId);

    const wallet = await this.walletRepository.findByUserId(userId);
    if (wallet.tokens < MIN_TOKEN_FOR_PRODUCT_CREATION) {
      throw new KalamcheError(KalamcheErrorType.NotEnoughTokens);
    }

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let asin = characters.charAt(Math.floor(Math.random() * 26));
    for (let i = 0; i < 9; i++) {
      asin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const updateTasks: Promise<void>[] = [];
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
        status: "draft",
      });

      const uploadedImages =
        await this.productImageRepository.findManyByTempProductId(
          tx,
          tempProduct.id,
        );
      uploadedImages.map((image) => {
        updateTasks.push(
          this.s3Service.updateObjectTag(image.id, "temp", "false"),
        );
      });

      const redirectPageUrl = `${OFFER_REDIRECT_PAGE_BASE_URL}/${product.shopId}/${product.id}`;
      await Promise.all([
        this.productOfferRepository.insert(tx, {
          redirectPageUrl,
          finalPrice: payload.initialPrice,
          pageUrl: payload.websiteUrl,
          productId: product.id,
          shopId: product.shopId,
          title: payload.title,
          status: "active",
          byboxWinner: false,
        }),
        this.productImageRepository.updateByTempProductId(tx, product.id, {
          tempProductId: null,
          productId: product.id,
        }),
      ]);

      await this.tempProductRepository.delete(tx, productId);

      return product;
    });

    await Promise.all(updateTasks);
    return result;
  }

  async createOffer(
    userId: string,
    productId: string,
    payload: CreateOfferDto,
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

      const redirectPageUrl = `${OFFER_REDIRECT_PAGE_BASE_URL}/${userShop.id}/${productId}`;
      return await this.productOfferRepository.insert(tx, {
        ...payload,
        redirectPageUrl,
        productId,
        status: "active",
        shopId: userShop.id,
        byboxWinner: false,
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
    const MAX_IMAGES = 5; // Regular images limit
    return this.db.transaction(async (tx) => {
      // Check for user uploaded images limit
      const [existingThumbnail, totalExistingImages] = await Promise.all([
        this.productImageRepository.isThumbnailExists(tx, productId, isTemp),
        this.productImageRepository.countTotal(tx, productId, isTemp),
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
    params: RedirectToProductPageDto,
  ): Promise<string> {
    let ip: string | undefined = req.headers["x-forwarded-for"] as string;
    if (ip) {
      ip = ip.split(",")[0].trim();
    } else {
      ip =
        (req.headers["x-real-ip"] as string) ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip;
    }

    if (!ip) {
      throw new KalamcheError(KalamcheErrorType.BadRequest);
    }

    const userAgent = req.headers["user-agent"] as string;

    const [shop, offer] = await Promise.all([
      this.shopRepository.findById(params.shopId),
      this.productOfferRepository.findByProductId(params.productId),
      this.productRepository.findById(params.productId),
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
    params: PaginationDto,
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

  // TODO: add filter for same products(only the cheapest most be on serach resutl)
  // async search(query: SearchDto): Promise<SearchResponse> {
  //   const result = await this.productRepository.findProductsByFilter(
  //     query.sort,
  //     query.brand,
  //     query.q,
  //     query.prMax,
  //     query.prMin,
  //     query.limit,
  //     query.offset,
  //   );

  //   const hasNext = result.length > query.limit;
  //   result.pop();

  //   if (result.length === 0) {
  //     return {
  //       products: [],
  //       hasNext: false,
  //     };
  //   }

  //   // we use most matched product to query brand name to find related brands
  //   // NOTE: for the example dataset of products thet the brands might not match to
  //   // kalamche default brands in production remove the ? : []
  //   // const brand = BrandsDataset.find((brand) => brand.key === result[0].brand);
  //   // const relatedBrands = brand
  //   //   ? BrandsDataset.filter((b) => b.type === brand.type)
  //   //   : [];
  //   const relatedBrands = [];

  //   const priceRange = {
  //     min: result[0].minPrice,
  //     max: result[0].maxPrice,
  //   };
  //   const products = result.map((p) => ({
  //     id: p.product.id,
  //     name: p.product.title,
  //     price: p.offer!.price,
  //     sellerName: p.shop!.name,
  //     imageUrl: p.image?.url || "",
  //   }));

  //   return {
  //     brands: relatedBrands,
  //     priceRange,
  //     products: [],
  //     hasNext,
  //   };
  // }
}
