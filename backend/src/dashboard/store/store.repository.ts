import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { eq, InferInsertModel } from "drizzle-orm";
import { Store, StoreRecord } from "./types/store";
import { DATABASE_CONNECTION } from "src/database";
import { storeSchema } from "src/database/schemas";
import { Postgres } from "src/database/types";

export type InsertStoreDto = InferInsertModel<typeof storeSchema>;

export type UpdateStoreDto = {
  name?: string;
  description?: string;
  image?: {
    id: string;
    url: string;
  };
  siteUrl?: string;
};

@Injectable()
export class StoreRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Postgres,
  ) {}

  private intoRecord(storeModel: Store): StoreRecord {
    return {
      id: storeModel.id,
      name: storeModel.name,
      description: storeModel.description,
      image: storeModel.image,
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

    return this.intoRecord(store[0]);
  }

  public async findById(storeId: string): Promise<StoreRecord> {
    const store = await this.db.query.storeSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, storeId),
      columns: {
        updatedAt: false,
      },
    });

    if (!store) {
      throw new NotFoundException();
    }

    return store;
  }

  public async findImage(storeId: string): Promise<{
    userId: string;
    imageId: string;
  }> {
    const result = await this.db.query.storeSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, storeId),
      columns: {
        image: true,
        userId: true,
      },
    });

    if (!result) {
      throw new NotFoundException();
    }

    return {
      imageId: result.image.id,
      userId: result.userId,
    };
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

  public async findByUserId(storeId: string, userId: string): Promise<boolean> {
    const storeExists = await this.db.query.storeSchema.findFirst({
      where: (table, funcs) =>
        funcs.and(funcs.eq(table.id, storeId), funcs.eq(table.userId, userId)),
      columns: {
        id: true,
      },
    });

    if (!storeExists) {
      return false;
    }

    return true;
  }
}
