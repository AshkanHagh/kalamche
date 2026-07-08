import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { S3Service } from "../attachment/services/s3.service";
import { CreateShopDto, PaginationDto, UpdateShopDto } from "./dto";
import {
  AnonymouseImageTable,
  ProductImageTable,
  ProductOfferTable,
  ProductTable,
  ShopTable,
  UserTable,
} from "src/drizzle/schemas";
import { DATABASE } from "src/drizzle/constants";
import { and, eq, sql } from "drizzle-orm";
import { USER_ROLE } from "src/constants/global.constant";
import { getImageNameFromUrl } from "src/utils/image-name";
import { desc } from "drizzle-orm";

@Injectable()
export class ShopService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
  ) {}

  async getMyShop(userId: string) {
    const shop = await this.db.query.ShopTable.findFirst({
      where: eq(ShopTable.userId, userId),
    });
    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }
    return shop;
  }

  async createShop(userId: string, payload: CreateShopDto) {
    return await this.db.transaction(async (tx) => {
      await tx
        .update(UserTable)
        .set({ roles: sql`array_append(roles, ${USER_ROLE.SELLER})` })
        .where(eq(UserTable.id, userId))
        .execute();

      let uploadedImageUrl: string | undefined;
      if (payload.imageId) {
        const uploadedImage = await tx.query.AnonymouseImageTable.findFirst({
          where: and(
            eq(AnonymouseImageTable.id, payload.imageId),
            eq(AnonymouseImageTable.usage, "shop"),
          ),
        });
        if (uploadedImage) {
          uploadedImageUrl = uploadedImage.url;
          // removing the temp flag from uploaded image
          await this.s3Service.removeImageTempFlag(uploadedImage.id);
        }
        await tx
          .delete(AnonymouseImageTable)
          .where(eq(AnonymouseImageTable.id, payload.imageId));
      }

      const [shop] = await tx
        .insert(ShopTable)
        .values({
          userId,
          imageUrl: uploadedImageUrl,
          ...payload,
        })
        .returning();
      return shop;
    });
  }

  async deleteShop(userId: string) {
    const shop = await this.getMyShop(userId);

    await this.db.transaction(async (tx) => {
      // Deleting a shop removes its associated product offer.
      // Users, including the product creator, will lose access and editing rights to the product.
      await Promise.all([
        tx.delete(ShopTable).where(eq(ShopTable.id, shop.id)),
        tx
          .update(UserTable)
          .set({ roles: sql`array_append(roles, ${USER_ROLE.SELLER})` })
          .where(eq(UserTable.id, userId))
          .execute(),
      ]);
      if (shop.imageUrl) {
        await this.s3Service.delete(getImageNameFromUrl(shop.imageUrl));
      }
    });
  }

  async updateShop(userId: string, payload: UpdateShopDto) {
    const shop = await this.getMyShop(userId);
    const [updatedShop] = await this.db
      .update(ShopTable)
      .set(payload)
      .where(eq(ShopTable.id, shop.id))
      .returning();
    return updatedShop;
  }

  async getProducts(userId: string, params: PaginationDto) {
    const shop = await this.getMyShop(userId);

    const products = await this.db.query.ProductTable.findMany({
      where: eq(ProductTable.shopId, shop.id),
      with: {
        images: {
          where: eq(ProductImageTable.isThumbnail, true),
        },
        offers: {
          where: eq(ProductOfferTable.shopId, shop.id),
        },
      },
      orderBy: desc(ProductTable.createdAt),
      limit: params.limit + 1,
      offset: params.offset,
    });
    // updates obj to have one of images and if offer dosent exists then set to a default value
    return products.map(({ images, offers, ...product }) => ({
      imageUrl: images[0]?.url || "",
      price: offers[0]?.finalPrice || 0,
      ...product,
    }));
  }
}
