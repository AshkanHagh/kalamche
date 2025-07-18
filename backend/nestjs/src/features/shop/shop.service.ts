import { Injectable } from "@nestjs/common";
import { IShopService } from "./interfaces/service";
import { IShop, IUser } from "src/drizzle/types";
import { RepositoryService } from "src/repository/repository.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { S3Service } from "../product/services/s3.service";
import { UpdateShopCreationDto, UpdateShopDto } from "./dto";
import { USER_ROLE } from "src/constants/global.constant";

@Injectable()
export class ShopService implements IShopService {
  constructor(
    private repo: RepositoryService,
    private s3Service: S3Service,
  ) {}

  async createShop(user: IUser): Promise<IShop> {
    const hasShop = await this.repo.shop().findByUserId(user.id);
    if (hasShop) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }
    await this.repo
      .user()
      .update(user.id, { roles: [...user.roles, USER_ROLE.SELLER] });
    const shop = await this.repo.shop().insert({ userId: user.id });
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
      const imageId = shop.imageUrl.split("/").at(-1)!;
      console.log(imageId);
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

  async updateShopCreation(
    userId: string,
    shopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop> {
    const shop = await this.repo.shop().findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (!shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }

    const updatedShop = this.repo
      .shop()
      .update(shopId, { isTemp: false, ...payload });
    return updatedShop;
  }

  async deleteShop(userId: string, shopId: string): Promise<void> {
    const shop = await this.repo.shop().findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (shop.imageUrl) {
      const imageId = shop.imageUrl.split("/").at(-1)!;
      await this.s3Service.delete(imageId);
    }
    await this.repo.shop().delete(shopId);
  }

  async getShop(shopId: string): Promise<IShop> {
    const shop = await this.repo.shop().findById(shopId);
    if (shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    return shop;
  }

  async updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShop> {
    const shop = await this.repo.shop().findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const updatedShop = this.repo.shop().update(shopId, payload);
    return updatedShop;
  }
}
