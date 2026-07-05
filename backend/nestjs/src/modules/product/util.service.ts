import { Inject, Injectable } from "@nestjs/common";
import sharp from "sharp";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ProductImageRepository } from "src/repository/repositories/product-image.repository";
import { ProductRepository } from "src/repository/repositories/product.repository";
import { ShopRepository } from "src/repository/repositories/shop.repository";
import { S3Service } from "./services/s3.service";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import {
  ProductOfferTable,
  ShopViewTable,
  WalletTable,
} from "src/drizzle/schemas";
import { WalletRepository } from "src/repository/repositories/wallet.repository";
import { eq } from "drizzle-orm";

@Injectable()
export class ProductUtilService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private productRepository: ProductRepository,
    private shopRepository: ShopRepository,
    private productImageRepository: ProductImageRepository,
    private walletRepository: WalletRepository,
    private s3Service: S3Service,
  ) {}

  async userHasPermission(
    userId: string,
    // Shop ID can be null if products are no longer associated with a shop
    shopId: string | null,
    productId?: string,
  ) {
    // deny access if no shop ID is provided
    if (!shopId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId || shop.status !== "verified") {
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
      // TODO: Move image resizing to a separate thread and retrieve result
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

  async handleTokenCharging(
    userId: string,
    shopId: string,
    productId: string,
    ip: string,
    userAgent: string,
  ) {
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

    try {
      await this.db.transaction(async (tx) => {
        const view = await tx.query.ShopViewTable.findFirst({
          where: (table, funcs) =>
            funcs.and(
              funcs.eq(table.shopId, shopId),
              funcs.eq(table.productId, productId),
              funcs.eq(table.ip, ip),
              funcs.gt(table.createdAt, twelveHoursAgo),
            ),
          columns: { id: true },
        });

        if (!view) {
          const [userWallet] = await tx
            .select()
            .from(WalletTable)
            .where(eq(WalletTable.userId, userId));
          if (userWallet.tokens < 1) {
            await tx.update(ProductOfferTable).set({ status: "inactive" });
            throw new KalamcheError(KalamcheErrorType.FailedToRedirect);
          }

          await Promise.all([
            this.walletRepository.consumeTokens(tx, userId, 1),
            tx.insert(ShopViewTable).values({
              productId,
              shopId,
              ip,
              tokenCharged: 1,
              userAgent,
            }),
          ]);
        }
      });
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.TokenChargingFailed, error);
    }
  }
}
