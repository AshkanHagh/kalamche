import { Database } from "src/drizzle/types";
import { Inject } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import {
  IShop,
  IShopInsertForm,
  IShopRecord,
  IShopUpdateForm,
  ShopTable,
} from "src/drizzle/schemas";
import { eq, getTableColumns } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IShopRepo } from "../interfaces/IShopRepo";

export class ShopRepository implements IShopRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(tx: Database, form: IShopInsertForm): Promise<IShop> {
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

  async findById(id: string): Promise<IShopRecord> {
    const shop = await this.db.query.ShopTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, id),
      columns: {
        updatedAt: false,
        emailVerifiedAt: false,
      },
    });
    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return shop;
  }

  async userHasShop(userId: string): Promise<boolean> {
    const [shop] = await this.db
      .select()
      .from(ShopTable)
      .where(eq(ShopTable.userId, userId));

    return !!shop;
  }

  async update(
    tx: Database,
    id: string,
    form: IShopUpdateForm,
  ): Promise<IShopRecord> {
    const { emailVerifiedAt, updatedAt, ...rest } = getTableColumns(ShopTable);

    const [shop] = await tx
      .update(ShopTable)
      .set(form)
      .where(eq(ShopTable.id, id))
      .returning(rest);
    return shop;
  }

  async delete(tx: Database, id: string): Promise<void> {
    await tx.delete(ShopTable).where(eq(ShopTable.id, id));
  }
}
