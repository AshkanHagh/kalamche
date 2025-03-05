import { Module } from "@nestjs/common";
import { AuthController } from "./auth/auth.controller";
import { GithubOAuthProvider } from "./auth/providers/github.provider";

@Module({
  providers: [GithubOAuthProvider],
  controllers: [AuthController],
})
export class FeaturesModule {}
