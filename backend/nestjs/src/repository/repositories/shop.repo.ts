import {
  Database,
  IShop,
  IShopInsertForm,
  IShopUpdateForm,
} from "src/drizzle/types";
import { IShopRepository } from "../interfaces/repository";
import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { ShopTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

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

  async findById(id: string): Promise<IShop> {
    const [shop] = await this.db
      .select()
      .from(ShopTable)
      .where(eq(ShopTable.id, id));
    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return shop;
  }

  async update(id: string, form: IShopUpdateForm): Promise<IShop> {
    const [shop] = await this.db
      .update(ShopTable)
      .set(form)
      .where(eq(ShopTable.id, id))
      .returning();
    return shop;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(ShopTable).where(eq(ShopTable.id, id));
  }
}
