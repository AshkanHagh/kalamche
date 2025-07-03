import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./repositories/user";
import { PendingUserRepository } from "./repositories/pending-user";
import { RepositoryService } from "./repository.service";

const repositories = [UserRepository, PendingUserRepository];

@Module({
  imports: [DrizzleModule],
  providers: [RepositoryService, ...repositories],
  exports: [RepositoryService],
})
export class RepositoryModule {}
