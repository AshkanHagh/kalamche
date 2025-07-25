import { IOAuthAccount, IOAuthAccountInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IOAuthAccountRepo {
  findByProvider(
    tx: Database,
    providerName: string,
    providerId: string,
  ): Promise<IOAuthAccount | undefined>;
  insert(tx: Database, form: IOAuthAccountInsertForm): Promise<IOAuthAccount>;
}
