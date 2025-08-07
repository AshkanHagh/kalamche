import { IWallet, IWalletInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IWalletRepo {
  updateWalletTokens(
    tx: Database,
    userId: string,
    tokens: number,
  ): Promise<void>;
  insert(tx: Database, form: IWalletInsertForm): Promise<void>;
  findByUserId(userId: string): Promise<IWallet>;
  consumeTokens(tx: Database, userId: string, tokens: number): Promise<void>;
}
