import {
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
  IShop,
  IShopInsertForm,
  IShopUpdateForm,
  IUser,
  IUserInsertForm,
  IUserLoginToken,
  IUserLoginTokenInsertForm,
  IUserUpdateForm,
  IUserView,
} from "src/drizzle/types";

export interface IUserRepository {
  emailExists(email: string): Promise<boolean>;
  findByEmail(email: string): Promise<IUser | undefined>;
  findUserView(id: string): Promise<IUserView>;
  insert(form: IUserInsertForm): Promise<IUser>;
  findById(id: string): Promise<IUser | undefined>;
  update(id: string, form: IUserUpdateForm): Promise<IUser>;
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

export interface IProductRepository {
  findProductsByFilter(
    sort: "cheapest" | "view" | "newest" | "expensive" | "popular",
    brand: string,
    search: string,
    prMax: number,
    prMin: number,
    limit: number,
    offset: number,
  ): Promise<unknown>;
}

export interface IShopRepository {
  findByUserId(userId: string): Promise<IShop | undefined>;
  insert(form: IShopInsertForm): Promise<IShop>;
  findById(id: string): Promise<IShop>;
  update(id: string, form: IShopUpdateForm): Promise<IShop>;
  delete(id: string): Promise<void>;
}
