import {
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
  IUser,
  IUserInsertForm,
  IUserLoginToken,
  IUserLoginTokenInsertForm,
  IUserView,
} from "src/drizzle/types";

export interface IUserRepository {
  emailExists(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<IUser | undefined>;
  findUserView(id: string): Promise<IUserView>;
  insert(form: IUserInsertForm): Promise<IUser>;
  findById(id: string): Promise<IUser | undefined>;
}

export interface IPendingUserRepository {
  findByEmail(email: string): Promise<IPendingUser | undefined>;
  update(
    id: string,
    form: IPendingUserUpdateForm | undefined,
  ): Promise<IPendingUser>;
  insert(form: IPendingUserInsertForm): Promise<IPendingUser>;
  findById(id: string): Promise<IPendingUser | undefined>;
  deleteById(id: string): Promise<void>;
}

export interface IUserLoginTokenRepository {
  findByUserId(userId: string): Promise<IUserLoginToken>;
  insertOrUpdate(form: IUserLoginTokenInsertForm): Promise<IUserLoginToken>;
}
