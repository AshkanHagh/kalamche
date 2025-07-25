import {
  Database,
  IUserLoginToken,
  IUserLoginTokenInsertForm,
} from "src/drizzle/types";

export interface IUserLoginTokenRepo {
  findByUserId(userId: string): Promise<IUserLoginToken>;
  insertOrUpdate(
    form: IUserLoginTokenInsertForm,
    tx?: Database,
  ): Promise<IUserLoginToken>;
}
