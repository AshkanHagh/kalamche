import { Inject, Injectable } from "@nestjs/common";
import { IShopService } from "./interfaces/IService";
import { Database, IShop, IShopRecord } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { S3Service } from "../product/services/s3.service";
import { UpdateShopCreationDto, UpdateShopDto, UploadImageDto } from "./dto";
import { USER_ROLE } from "src/constants/global.constant";
import { UserRepository } from "src/repository/repositories/user.repository";
import { ShopRepository } from "src/repository/repositories/shop.repository";
import { ITempShop } from "src/drizzle/schemas";
import { TempShopRepository } from "src/repository/repositories/temp-shop.repository";
import { DATABASE } from "src/drizzle/constants";
import sharp from "sharp";

@Injectable()
export class ShopService implements IShopService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private shopRepository: ShopRepository,
    private userRepository: UserRepository,
    private tempShopRepository: TempShopRepository,
    private s3Service: S3Service,
  ) {}

  async createShop(userId: string): Promise<ITempShop> {
    const tempShopExists = await this.tempShopRepository.existsByUserId(userId);
    if (tempShopExists) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }
    const shopExists = await this.shopRepository.userHasShop(userId);
    if (shopExists) {
      throw new KalamcheError(KalamcheErrorType.ShopAlreadyExists);
    }

    return await this.db.transaction(async (tx) => {
      await this.userRepository.updateRole(
        tx,
        userId,
        USER_ROLE.PENDING_SELLER,
      );

      return await this.tempShopRepository.insert(tx, { userId });
    });
  }

  async uploadImage(
    userId: string,
    params: UploadImageDto,
    image: Express.Multer.File,
  ): Promise<void> {
    const repository = params.isTempShop
      ? this.tempShopRepository
      : this.shopRepository;
    const shop = await repository.findById(params.shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    let imageUrl: string;
    try {
      const fileBuffer = await sharp(image.buffer)
        .resize({
          height: 800,
          width: 800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      imageUrl = await this.s3Service.putObject(
        crypto.randomUUID(),
        "image/webp",
        fileBuffer,
        true,
      );
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ImageProcessingFailed, error);
    }

    if (shop.imageUrl) {
      const imageId = shop.imageUrl.split("/").at(-1)!;
      await this.s3Service.delete(imageId);
    }

    await repository.update(params.shopId, { imageUrl });
  }

  async completeShopCreation(
    userId: string,
    tempShopId: string,
    payload: UpdateShopCreationDto,
  ): Promise<IShop> {
    const tempShop = await this.tempShopRepository.findById(tempShopId);
    if (tempShop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    return await this.db.transaction(async (tx) => {
      await Promise.all([
        this.userRepository.updateRole(tx, userId, USER_ROLE.SELLER),
        this.tempShopRepository.delete(tx, tempShopId),
      ]);

      if (tempShop.imageUrl) {
        const imageId = tempShop.imageUrl.split("/").at(-1)!;
        await this.s3Service.updateObjectTag(imageId, "temp", "false");
      }

      // because we dont have admin dashboard yet we verify all the shops,
      return await this.shopRepository.insert(tx, {
        userId,
        id: tempShop.id,
        status: "verified",
        imageUrl: tempShop.imageUrl,
        ...payload,
      });
    });
  }

  async deleteTempShop(userId: string, tempShopId: string): Promise<void> {
    const tempShop = await this.tempShopRepository.findById(tempShopId);
    if (tempShop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    await this.db.transaction(async (tx) => {
      if (tempShop.imageUrl) {
        await this.s3Service.delete(tempShop.imageUrl.split("/").at(-1)!);
      }

      await this.userRepository.removeRoles(tx, userId, [
        USER_ROLE.PENDING_SELLER,
      ]);
      await this.tempShopRepository.delete(tx, tempShopId);
    });
  }

  async deleteShop(userId: string, shopId: string): Promise<void> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    await this.db.transaction(async (tx) => {
      if (shop.imageUrl) {
        await this.s3Service.delete(shop.imageUrl.split("/").at(-1)!);
      }
      await this.userRepository.removeRoles(tx, userId, [USER_ROLE.SELLER]);

      // Deleting a shop removes its associated product offer.
      // Users, including the product creator, will lose access and editing rights to the product.
      await this.shopRepository.delete(tx, shopId);
    });
  }

  async getShop(shopId: string): Promise<IShopRecord> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.status !== "verified") {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return shop;
  }

  async updateShop(
    userId: string,
    shopId: string,
    payload: UpdateShopDto,
  ): Promise<IShopRecord> {
    const shop = await this.shopRepository.findById(shopId);
    if (shop.userId !== userId) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    if (shop.status === "pending") {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    const updatedShop = await this.shopRepository.update(shopId, payload);
    return updatedShop;
  }
}
