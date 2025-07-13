import { Inject, Injectable } from "@nestjs/common";
import { IRepositoryService } from "./interfaces/service";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { UserRepository } from "./repositories/user";
import { PendingUserRepository } from "./repositories/pending-user";
import { UserLoginTokenRepository } from "./repositories/user-login-token";
import { ProductRepository } from "./repositories/product";

@Injectable()
export class RepositoryService implements IRepositoryService {
  constructor(
    @Inject(DATABASE) private conn: Database,
    private UserRepo: UserRepository,
    private PendingUserRepo: PendingUserRepository,
    private UserLoginTokenRepo: UserLoginTokenRepository,
    private ProductRepo: ProductRepository,
  ) {}

  db(): Database {
    return this.conn;
  }

  pendingUser(): PendingUserRepository {
    return this.PendingUserRepo;
  }

  user(): UserRepository {
    return this.UserRepo;
  }

  userLoginToken(): UserLoginTokenRepository {
    return this.UserLoginTokenRepo;
  }

  product(): ProductRepository {
    return this.ProductRepo;
  }
}
