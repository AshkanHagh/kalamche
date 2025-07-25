import { IOAuthState, IOAuthStateInsertForm } from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface IOAuthStateRepo {
  insert(form: IOAuthStateInsertForm): Promise<void>;
  findByState(providerName: string, state: string): Promise<IOAuthState>;
  delete(tx: Database, id: string): Promise<void>;
}
