import { OAuthClient, OAuthUser } from "./oauth-clients";
import { AuthOptions } from "src/config/app.config";
import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/error.exception";
export class OAuthManager {
  private readonly clients: Map<string, OAuthClient> = new Map();

  // TODO: fix later config is undifined
  constructor(config: AuthOptions["oauthProvidersOption"]) {
    const githubOAuth = new OAuthClient(config!.github, "github");

    this.clients.set(githubOAuth.name, githubOAuth);
  }

  public getAuthorizeUrl(providerName: string): string {
    const provider = this.clients.get(providerName);
    if (!provider) {
      throw new KalamcheError(KalamcheErrorType.OAuthNotConfigured);
    }

    switch (providerName) {
      case "github": {
        return provider.getAuthorizeUrl(providerName, [
          "user:read",
          "user:email",
        ]);
      }
      default: {
        throw new KalamcheError(KalamcheErrorType.OAuthNotConfigured);
      }
    }
  }

  public async authenticate(
    providerName: string,
    code: string,
  ): Promise<OAuthUser> {
    const provider = this.clients.get(providerName);
    if (!provider) {
      throw new KalamcheError(KalamcheErrorType.OAuthNotConfigured);
    }

    return await provider.authentiate(providerName, code);
  }
}
