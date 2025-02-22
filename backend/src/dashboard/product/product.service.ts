import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import {
  InsertProductDto,
  UpdateProductDto as RepUpdateProductDto,
  ProductRepository,
} from "./product.repository";
import { CreateProductDto } from "./dto/create-product";
import { ProductRecord } from "./types/product";
import { StoreService } from "../store/store.service";
import { CatchError } from "src/common/utils/error";
import { UpdateProductDto } from "./dto/update-product";
import { ImageProvider } from "../common/services/image/image.provider";
import { MinioProvider } from "../common/services/image/minio.provider";
import { Image } from "src/database/schemas/types";

@Injectable()
export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly storeService: StoreService,
    @Inject(MinioProvider)
    private readonly imageProvider: ImageProvider,
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

  public async checkOldImagesHasDeleted(productId: string, newImages: Image[]) {
    try {
      const oldImages = await this.repository.findProductImages(productId);

      const newImageIds = new Set(newImages.map((img) => img.id));
      const deletedImages = oldImages.filter(
        (oldImage) => !newImageIds.has(oldImage.id),
      );

      await Promise.all(
        deletedImages.map(async (image) => {
          await this.imageProvider.checkImageExists(image.id);
        }),
      );

      for (let i = 0; i <= deletedImages.length; i++) {}
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async updateProduct(
    productId: string,
    storeId: string,
    userId: string,
    payload: UpdateProductDto,
  ): Promise<ProductRecord> {
    if (!(await this.storeService.isUserStoreOwner(storeId, userId))) {
      throw new ForbiddenException();
    }

    const updateProductDto: RepUpdateProductDto = {
      ...payload,
    };
    const store = await this.repository.update(productId, updateProductDto);

    return store;
  }

  public async deleteProduct(
    userId: string,
    productId: string,
    storeId: string,
  ): Promise<void> {
    try {
      if (!(await this.storeService.isUserStoreOwner(storeId, userId))) {
        throw new ForbiddenException();
      }

      const oldImages = await this.repository.findProductImages(productId);
      await Promise.all(
        oldImages.map(
          async (image) => await this.imageProvider.delete(image.id),
        ),
      );

      await this.repository.deleteProduct(productId);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async searchProducts(limit: number, offset: number, name: string) {
    try {
      return await this.repository.findPaginated(limit, offset, name);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
