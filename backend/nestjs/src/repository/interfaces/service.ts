import { Database } from "src/drizzle/types";
import { PendingUserRepository } from "../repositories/pending-user";
import { UserRepository } from "../repositories/user";
import { UserLoginTokenRepository } from "../repositories/user-login-token";

export interface IRepositoryService {
  user(): UserRepository;
  pendingUser(): PendingUserRepository;
  userLoginToken(): UserLoginTokenRepository;
  db(): Database;
}
