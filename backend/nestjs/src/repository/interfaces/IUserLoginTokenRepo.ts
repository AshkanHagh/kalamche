import {
  Database,
  IUserLoginToken,
  IUserLoginTokenInsertForm,
} from "src/drizzle/types";

export interface IUserLoginTokenRepo {
  findByUserId(userId: string): Promise<IUserLoginToken>;
  insertOrUpdate(
    tx: Database,
    form: IUserLoginTokenInsertForm,
  ): Promise<IUserLoginToken>;
}
