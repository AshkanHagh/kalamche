import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InferInsertModel } from "drizzle-orm";
import { storeSchema } from "src/database/schemas";
import { Sqlite } from "src/database/types";
import { Store, StoreRecord } from "./types/store";
import { DATABASE_CONNECTION } from "src/database";
import { Image } from "../image/types/image";

export type InsertStoreDto = InferInsertModel<typeof storeSchema>;

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
}
