import { Inject, Injectable } from "@nestjs/common";
import { ImageProvider } from "../common/services/image/image.provider";
import { MinioProvider } from "../common/services/image/minio.provider";
import { InsertStoreDto, StoreRepository } from "./store.repository";
import { CreateStoreDto } from "./dto/create-store";
import { StoreRecord } from "./types/store";
import { CatchError } from "src/common/utils/error";

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
        imageId: createDto.imageId,
        siteUrl: createDto.siteUrl,
        userId,
      };

      return await this.repository.insert(insertDto);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
