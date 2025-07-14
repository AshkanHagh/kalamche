import { Database, IShop, IShopInsertForm } from "src/drizzle/types";
import { IShopRepository } from "../interfaces/repository";
import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { ShopTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";

export class ShopRepository implements IShopRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IShopInsertForm): Promise<IShop> {
    const [shop] = await this.db.insert(ShopTable).values(form).returning();
    return shop;
  }

  async findByUserId(userId: string): Promise<IShop | undefined> {
    const [shop] = await this.db
      .select()
      .from(ShopTable)
      .where(eq(ShopTable.userId, userId));
    return shop;
  }
}
