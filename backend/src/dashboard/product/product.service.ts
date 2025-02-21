import { ForbiddenException, Injectable } from "@nestjs/common";
import { InsertProductDto, ProductRepository } from "./product.repository";
import { CreateProductDto } from "./dto/create-product";
import { ProductRecord } from "./types/product";
import { StoreService } from "../store/store.service";
import { CatchError } from "src/common/utils/error";

@Injectable()
export class ProductService {
  private readonly productKeywords = {
    laptop: ["laptop", "لپتاپ", "لپ تاپ", "loptop", "macbook", "notebook"],
    mobile: ["mobile", "گوشی", "smartphone", "تلفن", "موبایل", "cellphone"],
    pc: ["pc", "کامپیوتر", "desktop", "پی سی", "رایانه"],
  };

  private readonly filtersByProductType = {
    laptop: ["brand", "cpu", "ram", "gpu", "screenSize"],
    mobile: ["brand", "ram", "storage", "camera"],
    pc: ["brand", "cpu", "ram", "gpu"],
  };

  constructor(
    private readonly repository: ProductRepository,
    private readonly storeService: StoreService,
  ) {}

  public async createProduct(
    userId: string,
    payload: CreateProductDto,
  ): Promise<ProductRecord> {
    try {
      const isStoreOwner = await this.storeService.isUserStoreOwner(
        payload.storeId,
        userId,
      );

      if (!isStoreOwner) {
        throw new ForbiddenException();
      }

      const insertProductDto: InsertProductDto = {
        ...payload,
      };
      const product = await this.repository.insert(insertProductDto);

      return product;
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async getProduct(productId: string) {
    try {
      const product = await this.repository.findProductById(productId);
      const similerProductStores =
        await this.repository.findStoresByProductName(
          product.originalName,
          product.storeId,
        );

      return {
        product,
        similerProductStores,
      };
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private productSearchType(query: string): string | null {
    const lowerCaseQuery = query.toLowerCase();

    for (const [productType, keywords] of Object.entries(
      this.productKeywords,
    )) {
      for (const keyword of keywords) {
        if (lowerCaseQuery.includes(keyword)) {
          return productType;
        }
      }
    }

    return null;
  }

  public getSearchFilters(query: string): string[] {
    const productType = this.productSearchType(query);

    if (productType && this.filtersByProductType[productType]) {
      return this.filtersByProductType[productType];
    }

    return [];
  }
}
