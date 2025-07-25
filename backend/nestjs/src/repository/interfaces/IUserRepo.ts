import {
  Database,
  IUser,
  IUserInsertForm,
  IUserUpdateForm,
} from "src/drizzle/types";

export interface IUserRepo {
  emailExists(email: string): Promise<boolean>;
  findByEmail(email: string, tx?: Database): Promise<IUser | undefined>;
  insert(form: IUserInsertForm, tx?: Database): Promise<IUser>;
  findById(id: string, tx?: Database): Promise<IUser | undefined>;
  update(id: string, form: IUserUpdateForm): Promise<IUser>;
}
