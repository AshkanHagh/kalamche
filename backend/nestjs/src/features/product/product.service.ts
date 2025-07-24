import { Inject, Injectable } from "@nestjs/common";
import { IProductService } from "./interfaces/IService";
import {
  CompleteProductCreationDto,
  CreateOfferDto,
  CreateProductDto,
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
    private s3Service: S3Service,
  ) {}

  // TODO: add fr token logic after subscriptions added
  // 1. check user has min token required
  // 2. reduce required token
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

    if (process.env.NODE_ENV === "production") {
      const result = await fetch(
        `https://go-upc.com/api/v1/code/${payload.upc}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.GO_UPC_API_TOKEN}`,
          },
        },
      );
      if (result.status !== 200) {
        throw new KalamcheError(KalamcheErrorType.InvalidUpc);
      }
    }

    const tempProduct = await this.tempProductRepository.insert({
      shopId,
      upc: payload.upc,
    });
    return tempProduct;
  }

  async completeProductCreation(
    userId: string,
    productId: string,
    payload: CompleteProductCreationDto,
  ) {
    const tempProduct = await this.tempProductRepository.findById(productId);
    await this.productUtilService.userHasPermission(userId, tempProduct.shopId);

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let asin = characters.charAt(Math.floor(Math.random() * 26));
    for (let i = 0; i < 9; i++) {
      asin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const updateTasks: Promise<void>[] = [];
    const result = await this.db.transaction(async (tx) => {
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

      await Promise.all([
        this.productOfferRepository.insert(tx, {
          finalPrice: payload.initialPrice,
          pageUrl: payload.websiteUrl,
          productId: product.id,
          shopId: product.shopId,
          title: payload.title,
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

  // TODO: check and consume fr tokens
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

    const hasOffer = await this.productOfferRepository.checkShopOfferExists(
      userShop.id,
      productId,
    );
    if (hasOffer) {
      throw new KalamcheError(KalamcheErrorType.OfferAlreadyExists);
    }
    const offer = await this.productOfferRepository.insert(this.db, {
      ...payload,
      productId,
      shopId: userShop.id,
    });

    return offer;
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
