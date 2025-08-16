import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";

@Module({
  imports: [AuthModule, RepositoryModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
