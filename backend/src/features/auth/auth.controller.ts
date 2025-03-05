import { Controller, Get } from "@nestjs/common";
import { GithubOAuthProvider } from "./providers/github.provider";

@Controller("auth")
export class AuthController {
  constructor(private readonly githubProvider: GithubOAuthProvider) {}

  @Get("/oauth/github")
  public getAuthUrl() {
    const url = this.githubProvider.createAuthUrl();
    return { url };
  }
}
