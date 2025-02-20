import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq, InferInsertModel } from "drizzle-orm";
import { storeSchema } from "src/database/schemas";
import { Sqlite } from "src/database/types";
import { Store, StoreRecord } from "./types/store";
import { DATABASE_CONNECTION } from "src/database";
import { Image } from "../image/types/image";

export type InsertStoreDto = InferInsertModel<typeof storeSchema>;

export type UpdateStoreDto = {
  name?: string;
  description?: string;
  imageId?: string;
  siteUrl?: string;
};

@Injectable()
export class StoreRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Sqlite,
  ) {}

  private intoRecord(storeModel: Store, imageModel: Image): StoreRecord {
    return {
      id: storeModel.id,
      name: storeModel.name,
      description: storeModel.description,
      image: imageModel,
      userId: storeModel.userId,
      siteUrl: storeModel.siteUrl,
      createdAt: storeModel.createdAt,
    };
  }

  public async insert(storeDto: InsertStoreDto): Promise<StoreRecord> {
    const store = await this.db
      .insert(storeSchema)
      .values(storeDto)
      .returning();

    if (store.length === 0) {
      throw new HttpException(
        "Faild to insert store",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const storeImage = await this.db.query.image.findFirst({
      where: (table, funcs) => funcs.eq(table.id, store[0].imageId),
    });

    if (!storeImage) {
      throw new HttpException("Store have no image", HttpStatus.NOT_FOUND);
    }

    return this.intoRecord(store[0], storeImage);
  }

  public async findByIdWithImage(storeId: string): Promise<StoreRecord> {
    const result = await this.db.query.storeSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, storeId),
      with: {
        image: true,
      },
    });

    if (!result) {
      throw new NotFoundException();
    }

    const { image, ...store } = result;
    return this.intoRecord(store, image);
  }

  public async findImageId(storeId: string): Promise<{
    userId: string;
    imageId: string;
  }> {
    const result = await this.db.query.storeSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, storeId),
      columns: {
        imageId: true,
        userId: true,
      },
    });

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  public async update(
    storeId: string,
    storeDto: UpdateStoreDto,
  ): Promise<Store> {
    const store = await this.db
      .update(storeSchema)
      .set(storeDto)
      .where(eq(storeSchema.id, storeId))
      .returning();

    if (store.length === 0) {
      throw new HttpException(
        "Faild to update store",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return store[0];
  }

  public async delete(storeId: string): Promise<void> {
    await this.db.delete(storeSchema).where(eq(storeSchema.id, storeId));
  }
}
