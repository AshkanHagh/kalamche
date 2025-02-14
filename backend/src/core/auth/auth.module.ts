import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { GithubOauthSterategy } from "./services/oauth/github-strategy";
import { ConfigModule } from "@nestjs/config";
import { TokenService } from "./services/token/jwt";
import { UserModule } from "../user/user.module";

@Module({
  imports: [ConfigModule, UserModule],
  providers: [AuthService, GithubOauthSterategy, TokenService],
  controllers: [AuthController],
})
export class AuthModule {}
