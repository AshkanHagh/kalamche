import { Module } from "@nestjs/common";
import { UserRepository } from "./repository/user.repository";
import { DatabaseModule } from "src/database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
