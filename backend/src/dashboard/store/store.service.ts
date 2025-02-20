import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { ImageProvider } from "../common/services/image/image.provider";
import { MinioProvider } from "../common/services/image/minio.provider";
import { InsertStoreDto, StoreRepository } from "./store.repository";
import { CreateStoreDto } from "./dto/create-store";
import { StoreRecord } from "./types/store";
import { CatchError } from "src/common/utils/error";
import { UpdateStoreDto } from "./dto/update-store";
import { UpdateStoreDto as RepoUpdateStoreDto } from "./store.repository";

@Injectable()
export class StoreService {
  constructor(
    @Inject(MinioProvider)
    private readonly imageProvider: ImageProvider,
    private readonly repository: StoreRepository,
  ) {}

  public async insertStore(
    userId: string,
    createDto: CreateStoreDto,
  ): Promise<StoreRecord> {
    try {
      const insertDto: InsertStoreDto = {
        name: createDto.name,
        description: createDto.description,
        image: createDto.image,
        siteUrl: createDto.siteUrl,
        userId,
      };

      return await this.repository.insert(insertDto);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async findById(storeId: string): Promise<StoreRecord> {
    try {
      return await this.repository.findById(storeId);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private checkStoreUserId(userId: string, storeUserId: string): void {
    if (userId !== storeUserId) {
      throw new ForbiddenException();
    }
  }

  // TODO: filter site url
  public async updateStore(
    storeId: string,
    userId: string,
    updateDto: UpdateStoreDto,
  ): Promise<unknown> {
    try {
      const result = await this.repository.findImage(storeId);
      this.checkStoreUserId(userId, result.userId);

      if (updateDto.image) {
        await this.imageProvider.checkImageExists(result.imageId);
      }

      const storeUpdateDto: RepoUpdateStoreDto = {
        name: updateDto.name,
        description: updateDto.description,
        image: updateDto.image,
        siteUrl: updateDto.siteUrl,
      };
      const store = await this.repository.update(storeId, storeUpdateDto);

      return store;
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async deleteStore(userId: string, storeId: string): Promise<void> {
    try {
      const result = await this.repository.findImage(storeId);
      await this.imageProvider.delete(result.imageId);

      this.checkStoreUserId(userId, result.userId);

      await this.repository.delete(storeId);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
