import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./repositories/user";
import { PendingUserRepository } from "./repositories/pending-user";
import { RepositoryService } from "./repository.service";
import { UserLoginTokenRepository } from "./repositories/user-login-token";
import { ProductRepository } from "./repositories/product";

const repositories = [
  UserRepository,
  PendingUserRepository,
  UserLoginTokenRepository,
  ProductRepository,
];

@Module({
  imports: [DrizzleModule],
  providers: [RepositoryService, ...repositories],
  exports: [RepositoryService],
})
export class RepositoryModule {}
