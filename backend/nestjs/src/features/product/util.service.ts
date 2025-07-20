import { Injectable } from "@nestjs/common";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ProductRepository } from "src/repository/repositories/product.repository";
import { ShopRepository } from "src/repository/repositories/shop.repository";

@Injectable()
export class ProductUtilService {
  constructor(
    private productRepository: ProductRepository,
    private shopRepository: ShopRepository,
  ) {}

  async userHasPermission(
    userId: string,
    shopId: string,
    productId?: string,
  ): Promise<void> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId || shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    if (productId) {
      const product = await this.productRepository.findById(productId);
      if (product.shopId !== shopId) {
        throw new KalamcheError(KalamcheErrorType.PermissionDenied);
      }
    }
  }
}
