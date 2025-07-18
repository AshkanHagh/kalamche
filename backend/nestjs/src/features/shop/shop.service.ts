import { Injectable } from "@nestjs/common";
import { IShopService } from "./interfaces/service";
import { IShop, IUser } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { S3Service } from "../product/services/s3.service";
import { UpdateShopCreationDto, UpdateShopDto } from "./dto";
import { USER_ROLE } from "src/constants/global.constant";
import { UserRepository } from "src/repository/repositories/user.repository";
import { ShopRepository } from "src/repository/repositories/shop.repository";

@Injectable()
export class ShopService implements IShopService {
  constructor(
    private shopRepository: ShopRepository,
    private userRepository: UserRepository,
    private s3Service: S3Service,
  ) {}

  async createShop(user: IUser): Promise<IShop> {
    const hasShop = await this.shopRepository.findByUserId(user.id);
    if (hasShop) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }
    await this.userRepository.update(user.id, {
      roles: [...user.roles, USER_ROLE.SELLER],
    });
    const shop = await this.shopRepository.insert({ userId: user.id });
    return shop;
  }

  async uploadImage(
    userId: string,
    shopId: string,
    image: Express.Multer.File,
  ): Promise<void> {
    const shop = await this.shopRepository.findById(shopId);
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

    await this.shopRepository.update(shopId, { imageUrl: url });
  }

  async updateShopCreation(
    userId: string,
    shopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (!shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }

    const updatedShop = await this.shopRepository.update(shopId, {
      isTemp: false,
      ...payload,
    });
    return updatedShop;
  }

  async deleteShop(userId: string, shopId: string): Promise<void> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (shop.imageUrl) {
      const imageId = shop.imageUrl.split("/").at(-1)!;
      await this.s3Service.delete(imageId);
    }
    await this.shopRepository.delete(shopId);
  }

  async getShop(shopId: string): Promise<IShop> {
    const shop = await this.shopRepository.findById(shopId);
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
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (shop.isTemp) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    const updatedShop = await this.shopRepository.update(shopId, payload);
    return updatedShop;
  }
}
