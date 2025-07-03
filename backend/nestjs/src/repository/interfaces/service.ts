import { Database } from "src/drizzle/types";
import { PendingUserRepository } from "../repositories/pending-user";
import { UserRepository } from "../repositories/user";

export interface IRepositoryService {
  user(): UserRepository;
  pendingUser(): PendingUserRepository;
  db(): Database;
}
