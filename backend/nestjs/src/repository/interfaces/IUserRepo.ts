import {
  IUser,
  IUserInsertForm,
  IUserUpdateForm,
  IUserView,
} from "src/drizzle/types";

export interface IUserRepo {
  emailExists(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<IUser | undefined>;
  findUserView(id: string): Promise<IUserView>;
  insert(form: IUserInsertForm): Promise<IUser>;
  findById(id: string): Promise<IUser | undefined>;
  update(id: string, form: IUserUpdateForm): Promise<IUser>;
}
