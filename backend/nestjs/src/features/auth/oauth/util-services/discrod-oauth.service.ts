import { Injectable } from "@nestjs/common";
import { BaseOAuthService } from "./base-oauth.service";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { HttpService } from "@nestjs/axios";
import { IDiscordUser } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { firstValueFrom, map } from "rxjs";
import { OAuthUserPayload } from "../dto";

@Injectable()
export class DiscordOAuthService extends BaseOAuthService {
  constructor(
    @AuthConfig() private authConfig: IAuthConfig,
    private httpService: HttpService,
  ) {
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
  }

  async getUserInfo(accessToken: string): Promise<OAuthUserPayload> {
    try {
      const user = await firstValueFrom(
        this.httpService
          .get<IDiscordUser>("https://discord.com/api/users/@me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .pipe(map((res) => res.data)),
      );

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
