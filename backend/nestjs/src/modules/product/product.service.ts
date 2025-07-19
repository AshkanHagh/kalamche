import { Injectable } from "@nestjs/common";
import { IProductService } from "./interfaces/IService";
import { CreateProductDto, SearchDto } from "./dto";
import { SearchResponse } from "./types";
import { ProductRepository } from "src/repository/repositories/product.repository";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { TempProductRepository } from "src/repository/repositories/temp-product.repository";
import { ProductUtilService } from "./util.service";
import { ITempProduct } from "src/drizzle/schemas/temp-product.schema";

@Injectable()
export class ProductService implements IProductService {
  constructor(
    private productRepository: ProductRepository,
    private tempProductRepository: TempProductRepository,
    private productUtilService: ProductUtilService,
  ) {}

  // TODO: add fr token logic after subscriptions added
  // 1. check user has min token required
  // 2. reduce required token
  async createProduct(
    userId: string,
    shopId: string,
    payload: CreateProductDto,
  ): Promise<ITempProduct> {
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
      modelNumber: payload.modelNumber,
      upc: payload.upc,
    });
    return tempProduct;
  }

  // TODO: add filter for same products(only the cheapest most be on serach resutl)
  async search(query: SearchDto): Promise<SearchResponse> {
    const result = await this.productRepository.findProductsByFilter(
      query.sort,
      query.brand,
      query.q,
      query.prMax,
      query.prMin,
      query.limit,
      query.offset,
    );

    const hasNext = result.length > query.limit;
    result.pop();

    if (result.length === 0) {
      return {
        products: [],
        hasNext: false,
      };
    }

    // we use most matched product to query brand name to find related brands
    // NOTE: for the example dataset of products thet the brands might not match to
    // kalamche default brands in production remove the ? : []
    // const brand = BrandsDataset.find((brand) => brand.key === result[0].brand);
    // const relatedBrands = brand
    //   ? BrandsDataset.filter((b) => b.type === brand.type)
    //   : [];
    const relatedBrands = [];

    const priceRange = {
      min: result[0].minPrice,
      max: result[0].maxPrice,
    };
    const products = result.map((p) => ({
      id: p.product.id,
      name: p.product.title,
      price: p.offer!.price,
      sellerName: p.shop!.name,
      imageUrl: p.image?.url || "",
    }));

    return {
      brands: relatedBrands,
      priceRange,
      products: [],
      hasNext,
    };
  }
}
