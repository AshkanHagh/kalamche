import {
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
} from "src/drizzle/types";

export interface IPendingUserRepo {
  findByEmail(email: string): Promise<IPendingUser | undefined>;
  update(
    id: string,
    form: IPendingUserUpdateForm | undefined,
  ): Promise<IPendingUser>;
  insert(form: IPendingUserInsertForm): Promise<IPendingUser>;
  findById(id: string): Promise<IPendingUser | undefined>;
  deleteById(id: string): Promise<void>;
}
