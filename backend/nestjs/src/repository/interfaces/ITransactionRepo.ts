import { ITransaction, ITransactionInsertForm } from "src/drizzle/schemas";

export interface ITransactionRepo {
  insert(form: ITransactionInsertForm): Promise<ITransaction>;
}
