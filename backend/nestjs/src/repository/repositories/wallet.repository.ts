import { Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { DATABASE } from "src/drizzle/constants";
import { WalletTable } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { IWalletRepo } from "../interfaces/IWalletRepo";

@Injectable()
export class WalletRepository implements IWalletRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async updateWalletTokens(
    tx: Database,
    userId: string,
    tokens: number,
  ): Promise<void> {
    await this.db
      .update(WalletTable)
      .set({
        tokens: sql`${WalletTable.tokens} + ${tokens}`,
      })
      .where(eq(WalletTable.userId, userId));
  }
}
