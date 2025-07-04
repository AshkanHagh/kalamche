import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./repositories/user";
import { PendingUserRepository } from "./repositories/pending-user";
import { RepositoryService } from "./repository.service";
import { UserLoginTokenRepository } from "./repositories/user-login-token";

const repositories = [
  UserRepository,
  PendingUserRepository,
  UserLoginTokenRepository,
];

@Module({
  imports: [DrizzleModule],
  providers: [RepositoryService, ...repositories],
  exports: [RepositoryService],
})
export class RepositoryModule {}
