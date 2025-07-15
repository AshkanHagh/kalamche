import { Database } from "src/drizzle/types";
import { PendingUserRepository } from "../repositories/pending-user";
import { UserRepository } from "../repositories/user";
import { UserLoginTokenRepository } from "../repositories/user-login-token";
import { ProductRepository } from "../repositories/product";
import { ShopRepository } from "../repositories/shop.repo";

export interface IRepositoryService {
  user(): UserRepository;
  pendingUser(): PendingUserRepository;
  userLoginToken(): UserLoginTokenRepository;
  product(): ProductRepository;
  shop(): ShopRepository;
  db(): Database;
}
