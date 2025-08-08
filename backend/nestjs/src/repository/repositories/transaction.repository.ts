import { Inject, Injectable } from "@nestjs/common";
import { ITransactionRepo } from "../interfaces/ITransactionRepo";
import { DATABASE } from "src/drizzle/constants";
import {
  ITransactionInsertForm,
  ITransaction,
  TransactionTable,
  ITransactionUpdateForm,
  ITransactionRecord,
} from "src/drizzle/schemas";
import { Database } from "src/drizzle/types";
import { eq, getTableColumns } from "drizzle-orm";

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

  async findByReferenceId(referenceId: string): Promise<ITransaction> {
    const [transaction] = await this.db
      .select()
      .from(TransactionTable)
      .where(eq(TransactionTable.referenceId, referenceId));
    return transaction;
  }

  async update(
    tx: Database,
    id: string,
    form: ITransactionUpdateForm,
  ): Promise<ITransactionRecord> {
    const { error, updatedAt, ...rest } = getTableColumns(TransactionTable);

    const [transaction] = await tx
      .update(TransactionTable)
      .set(form)
      .where(eq(TransactionTable.id, id))
      .returning({ ...rest });
    return transaction;
  }
}
