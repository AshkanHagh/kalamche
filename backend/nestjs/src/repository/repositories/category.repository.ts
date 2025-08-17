import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { asc, eq, inArray, like, or } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ICategoryRepo } from "../interfaces/ICategoryRepo";
import { CategoryTable, ICategory } from "src/drizzle/schemas";

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

  async findBySlug(slug: string): Promise<ICategory | undefined> {
    const [category] = await this.db
      .select()
      .from(CategoryTable)
      .where(eq(CategoryTable.slug, slug));

    return category;
  }

  async findHierarchy(path: string) {
    const pathParts = path.split("/");
    const ancestorPaths: string[] = [];

    for (let i = 1; i <= pathParts.length; i++) {
      ancestorPaths.push(pathParts.slice(0, i).join("/"));
    }

    return await this.db
      .select()
      .from(CategoryTable)
      .where(
        or(
          inArray(CategoryTable.path, ancestorPaths),
          like(CategoryTable.path, `${path}/%`),
        ),
      )
      .orderBy(asc(CategoryTable.level));
  }

  async findAll(): Promise<ICategory[]> {
    return await this.db.select().from(CategoryTable);
  }
}
