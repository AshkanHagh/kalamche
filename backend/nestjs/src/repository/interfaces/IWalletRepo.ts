import { IWalletInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IWalletRepo {
  updateWalletTokens(
    tx: Database,
    userId: string,
    tokens: number,
  ): Promise<void>;
  insert(form: IWalletInsertForm): Promise<void>;
}
