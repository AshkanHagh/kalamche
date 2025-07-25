import { IUser, IUserRecord } from "src/drizzle/types";

export interface IUserController {
  getCurrentUser(user: IUser): IUserRecord;
}
