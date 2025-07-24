import { Injectable } from "@nestjs/common";
import sharp from "sharp";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ProductImageRepository } from "src/repository/repositories/product-image.repository";
import { ProductRepository } from "src/repository/repositories/product.repository";
import { ShopRepository } from "src/repository/repositories/shop.repository";
import { S3Service } from "./services/s3.service";
import { Database } from "src/drizzle/types";

@Injectable()
export class ProductUtilService {
  constructor(
    private productRepository: ProductRepository,
    private shopRepository: ShopRepository,
    private productImageRepository: ProductImageRepository,
    private s3Service: S3Service,
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

  async processImageUpload(
    file: Express.Multer.File,
    isThumbnail: boolean,
    productId: string,
    isTemp: boolean,
    tx: Database,
  ) {
    const imageRecord = await this.productImageRepository.insert(tx, {
      isCompleted: false,
      isThumbnail,
      productId: isTemp ? null : productId,
      tempProductId: isTemp ? productId : null,
      status: "published",
    });

    let imageUrl: string;
    try {
      const fileBuffer = await sharp(file.buffer)
        .resize({
          height: 800,
          width: 800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      imageUrl = await this.s3Service.putObject(
        imageRecord.id,
        file.mimetype,
        fileBuffer,
        true,
      );
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ImageProcessingFailed, error);
    }

    await this.productImageRepository.update(tx, imageRecord.id, {
      isCompleted: true,
      url: imageUrl,
    });
  }
}
