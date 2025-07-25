import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [RepositoryModule, AuthModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
