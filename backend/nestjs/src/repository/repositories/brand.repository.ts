import { Inject, Injectable } from "@nestjs/common";
import { IBrandRepo } from "../interfaces/IBrandRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { BrandTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class BrandRepository implements IBrandRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async exists(id: string): Promise<void> {
    const [brandId] = await this.db
      .select({ id: BrandTable.id })
      .from(BrandTable)
      .where(eq(BrandTable.id, id));

    if (!brandId) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
  }
}
