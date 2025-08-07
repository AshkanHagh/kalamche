import {
  Database,
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
} from "src/drizzle/types";

export interface IPendingUserRepo {
  findByEmail(email: string): Promise<IPendingUser | undefined>;
  update(
    tx: Database,
    id: string,
    form: IPendingUserUpdateForm | undefined,
  ): Promise<IPendingUser>;
  insert(tx: Database, form: IPendingUserInsertForm): Promise<IPendingUser>;
  findById(id: string): Promise<IPendingUser | undefined>;
  deleteByEmail(tx: Database, email: string): Promise<IPendingUser>;
  delete(tx: Database, id: string): Promise<IPendingUser>;
}
