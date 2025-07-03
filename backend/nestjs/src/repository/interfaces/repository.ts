import {
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
} from "src/drizzle/types";

export interface IUserRepository {
  emailExists(email: string): Promise<boolean>;
}

export interface IPendingUserRepository {
  findByEmail(email: string): Promise<IPendingUser | undefined>;

  update(
    id: string,
    form: IPendingUserUpdateForm | undefined,
  ): Promise<IPendingUser>;

  insert(form: IPendingUserInsertForm): Promise<IPendingUser>;
}
