import {
  Database,
  IUser,
  IUserInsertForm,
  IUserUpdateForm,
} from "src/drizzle/types";

export interface IUserRepo {
  emailExists(email: string): Promise<boolean>;
  findByEmail(tx: Database, email: string): Promise<IUser | undefined>;
  insert(tx: Database, form: IUserInsertForm): Promise<IUser>;
  findById(tx: Database, id: string): Promise<IUser | undefined>;
  update(id: string, form: IUserUpdateForm): Promise<IUser>;
  updateRole(tx: Database, id: string, role: string): Promise<void>;
}
