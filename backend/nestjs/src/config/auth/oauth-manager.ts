import { BadRequestException } from "@nestjs/common";
import { OAuthClient, OAuthUser } from "./oauth-clients";
import { OAuthOpitons } from "../app.config";

export class OAuthManager {
  private readonly clients: Map<string, OAuthClient> = new Map();

  constructor(config: OAuthOpitons) {
    const githubOAuth = new OAuthClient(config.github, "github");

    this.clients.set(githubOAuth.name, githubOAuth);
  }

  public getAuthorizeUrl(providerName: string): string {
    const provider = this.clients.get(providerName);
    if (!provider) {
      throw new BadRequestException("oauth provider not found");
    }

    switch (providerName) {
      case "github": {
        return provider.getAuthorizeUrl(providerName, [
          "user:read",
          "user:email",
        ]);
      }

      default: {
        throw new BadRequestException("oauth provider not found");
      }
    }
  }

  public async authenticate(
    providerName: string,
    code: string,
  ): Promise<OAuthUser> {
    const provider = this.clients.get(providerName);
    if (!provider) {
      throw new BadRequestException("oauth provider not found");
    }

    return await provider.authentiate(providerName, code);
  }
}
