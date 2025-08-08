import { Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { DATABASE } from "src/drizzle/constants";
import { IWallet, IWalletInsertForm, WalletTable } from "src/drizzle/schemas";
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
    await tx
      .update(WalletTable)
      .set({
        tokens: sql`${WalletTable.tokens} + ${tokens}`,
      })
      .where(eq(WalletTable.userId, userId));
  }

  async insert(tx: Database, form: IWalletInsertForm): Promise<void> {
    await tx.insert(WalletTable).values(form).execute();
  }

  async findByUserId(userId: string): Promise<IWallet> {
    const [wallet] = await this.db
      .select()
      .from(WalletTable)
      .where(eq(WalletTable.userId, userId))
      .execute();
    return wallet;
  }

  async consumeTokens(
    tx: Database,
    userId: string,
    tokens: number,
  ): Promise<void> {
    await tx
      .update(WalletTable)
      .set({
        tokens: sql`${WalletTable.tokens} - ${tokens}`,
      })
      .where(eq(WalletTable.userId, userId));
  }
}
