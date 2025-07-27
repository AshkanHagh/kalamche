import {
  ITransaction,
  ITransactionInsertForm,
  ITransactionRecord,
  ITransactionUpdateForm,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

export interface ITransactionRepo {
  insert(form: ITransactionInsertForm): Promise<ITransaction>;
  findByReferenceId(referenceId: string): Promise<ITransaction>;
  update(
    tx: Database,
    id: string,
    form: ITransactionUpdateForm,
  ): Promise<ITransactionRecord>;
}
