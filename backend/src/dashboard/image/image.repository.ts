import { Inject, Injectable } from "@nestjs/common";
import { DATABASE_CONNECTION } from "src/database";
import { Sqlite } from "src/database/types";
import { Image } from "./types/image";
import { InferInsertModel } from "drizzle-orm";
import { image } from "src/database/schemas";
import { CatchError } from "src/common/utils/error";

export type InsertImageDto = InferInsertModel<typeof image>;

@Injectable()
export class ImageRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Sqlite) {}

  async insert(imageDto: InsertImageDto): Promise<Image> {
    try {
      const result = await this.db.insert(image).values(imageDto).returning();
      return result[0];
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
