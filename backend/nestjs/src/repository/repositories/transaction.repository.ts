import { Inject, Injectable } from "@nestjs/common";
import { ITransactionRepo } from "../interfaces/ITransactionRepo";
import { DATABASE } from "src/drizzle/constants";
import {
  ITransactionInsertForm,
  ITransaction,
  TransactionTable,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";

@Injectable()
export class TransactionRepository implements ITransactionRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: ITransactionInsertForm): Promise<ITransaction> {
    const [transaction] = await this.db
      .insert(TransactionTable)
      .values(form)
      .returning();
    return transaction;
  }
}
