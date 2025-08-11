import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";
import { CategoryTable } from "src/drizzle/schemas";

@Injectable()
export class CategoryRepository implements ICategoryRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async exists(id: string): Promise<void> {
    const [categoryId] = await this.db
      .select({ id: CategoryTable.id })
      .from(CategoryTable)
      .where(eq(CategoryTable.id, id));

    if (!categoryId) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
  }
}
