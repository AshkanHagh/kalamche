import { Database } from "src/drizzle/types";

export interface IWalletRepo {
  updateWalletTokens(
    tx: Database,
    userId: string,
    tokens: number,
  ): Promise<void>;
}
