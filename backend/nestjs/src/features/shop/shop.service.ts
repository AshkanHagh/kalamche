import { Injectable } from "@nestjs/common";
import { IShopService } from "./interfaces/service";
import { IShop } from "src/drizzle/types";
import { RepositoryService } from "src/repository/repository.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { S3Service } from "../product/services/s3.service";

@Injectable()
export class ShopService implements IShopService {
  constructor(
    private repo: RepositoryService,
    private s3Service: S3Service,
  ) {}

  async createShop(userId: string): Promise<IShop> {
    const hasShop = await this.repo.shop().findByUserId(userId);
    if (hasShop) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }

    const shop = await this.repo.shop().insert({ userId });
    return shop;
  }

  async uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void> {
    const shop = await this.repo.shop().findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    if (shop.imageUrl) {
      const imageId = shop.imageUrl.split("/")[-1];
      await this.s3Service.delete(imageId);
    }

    const imageId = crypto.randomUUID();
    const url = await this.s3Service.putObject(
      imageId,
      image.mimetype,
      image.buffer,
    );

    await this.repo.shop().update(shopId, { imageUrl: url });
  }
}
