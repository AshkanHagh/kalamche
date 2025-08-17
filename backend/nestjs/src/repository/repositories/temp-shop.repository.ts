import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DATABASE } from "src/drizzle/constants";
import {
  ITempShop,
  ITempShopInsertForm,
  ITempShopUpdateForm,
  TempShopTable,
} from "src/drizzle/schemas/temp-shop.schema";
import { Database } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { ITempShopRepo } from "../interfaces/ITempShopRepo";

@Injectable()
export class TempShopRepository implements ITempShopRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findById(id: string): Promise<ITempShop> {
    const [shop] = await this.db
      .select()
      .from(TempShopTable)
      .where(eq(TempShopTable.id, id));

    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    return shop;
  }

  async existsByUserId(userId: string): Promise<boolean> {
    const [shop] = await this.db
      .select()
      .from(TempShopTable)
      .where(eq(TempShopTable.userId, userId));

    return !!shop;
  }

  async insert(tx: Database, form: ITempShopInsertForm): Promise<ITempShop> {
    const [shop] = await tx.insert(TempShopTable).values(form).returning();
    return shop;
  }

  async delete(tx: Database, id: string): Promise<void> {
    await tx.delete(TempShopTable).where(eq(TempShopTable.id, id)).execute();
  }

  async update(
    tx: Database,
    id: string,
    form: ITempShopUpdateForm,
  ): Promise<ITempShop> {
    const [shop] = await tx
      .update(TempShopTable)
      .set(form)
      .where(eq(TempShopTable.id, id))
      .returning();
    return shop;
  }
}
