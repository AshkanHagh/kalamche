import { Inject, Injectable } from "@nestjs/common";
import { ITempProductRepo } from "../interfaces/ITempProductRepo";
import {
  ITempProductInsertForm,
  ITempProduct,
  TempProductTable,
} from "src/drizzle/schemas/temp-product.schema";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { eq } from "drizzle-orm";

@Injectable()
export class TempProductRepository implements ITempProductRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: ITempProductInsertForm): Promise<ITempProduct> {
    const [product] = await this.db
      .insert(TempProductTable)
      .values(form)
      .returning();
    return product;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(TempProductTable)
      .where(eq(TempProductTable.id, id))
      .execute();
  }
}
