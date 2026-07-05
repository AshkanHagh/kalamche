import { Injectable } from "@nestjs/common";
import { BaseOAuthService } from "./base-oauth.service";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { DiscordOAuthUser, OAuthUser } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import ky, { KyInstance } from "ky";

@Injectable()
export class DiscordOAuthService extends BaseOAuthService {
  private ky: KyInstance;

  constructor(@AuthConfig() authConfig: IAuthConfig) {
    super({
      clientId: authConfig.oauth.discord.clientId,
      clientSecret: authConfig.oauth.discord.clientSecret,
      redirectUri: authConfig.oauth.discord.redirectUri,
      authorizeHost: "https://discord.com",
      tokenHost: "https://discord.com",
      authorizePath: "/oauth2/authorize",
      tokenPath: "/oauth2/token",
      scopes: ["email", "identify"],
    });

    this.ky = ky.create({
      prefix: "https://discord.com/api",
      headers: {
        "content-type": "application/json",
        "user-agent": "kalamche",
      },
      timeout: 1000 * 15,
      keepalive: true,
      retry: {
        afterStatusCodes: [429, 500, 502, 503, 504, 401, 403, 404],
        limit: 3,
      },
    });
  }

  async getUserInfo(accessToken: string): Promise<OAuthUser> {
    try {
      const user = await this.ky
        .get<DiscordOAuthUser>("users/@me", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json();

      if (user.verified) {
        throw new KalamcheError(KalamcheErrorType.OAuthAccountNotVerified);
      }

      return {
        providerId: user.id,
        email: user.email!,
        name: user.username,
        avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
        provider: "discord",
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.OAuthReqFailed, error);
    }
  }
}
