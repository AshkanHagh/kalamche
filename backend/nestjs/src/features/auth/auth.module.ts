import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { AuthUtilService } from "./util.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [RepositoryModule, EmailModule],
  providers: [AuthService, AuthUtilService],
  controllers: [AuthController],
  exports: [AuthUtilService],
})
export class AuthModule {}
