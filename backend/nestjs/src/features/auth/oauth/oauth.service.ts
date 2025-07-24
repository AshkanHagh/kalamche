import { Injectable } from "@nestjs/common";
import { IOAuthService } from "./interfaces/IOAuthService";
import { GithubOAuthService } from "./util-services/github-oauth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { OAuthStateRepository } from "src/repository/repositories/oauth-state.repository";

@Injectable()
export class OAuthService implements IOAuthService {
  constructor(
    private githubOAuthService: GithubOAuthService,
    private oauthStateRepositoyr: OAuthStateRepository,
  ) {}

  async initiateOAuth(providerName: string) {
    const provider = this.#getProvider(providerName);
    const state = provider.generateState();

    await this.oauthStateRepositoyr.insert({
      provider: providerName,
      state,
    });

    return provider.generateAuthUrl(state);
  }

  #getProvider(provider: string) {
    switch (provider) {
      case "github":
        return this.githubOAuthService;
      default: {
        throw new KalamcheError(KalamcheErrorType.InvalidOAuthProvider);
      }
    }
  }
}
