import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { BaseOAuthService } from "./base-oauth.service";
import { IGitHubUser, IGitHubUserEmail } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { OAUthUserDto } from "../dto";
import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom, map } from "rxjs";

@Injectable()
export class GithubOAuthService extends BaseOAuthService {
  constructor(
    @AuthConfig() private authConfig: IAuthConfig,
    private httpService: HttpService,
  ) {
    super({
      clientId: authConfig.oauth.github.clientId,
      clientSecret: authConfig.oauth.github.clientSecret,
      redirectUri: authConfig.oauth.github.redirectUri,
      scopes: ["read:user", "user:email"],
      authorizeHost: "https://github.com",
      tokenHost: "https://github.com",
      authorizePath: "/login/oauth/authorize",
      tokenPath: "/login/oauth/access_token",
    });
  }

  async getUserInfo(accessToken: string): Promise<OAUthUserDto> {
    try {
      const [user, userEmails] = await Promise.all([
        firstValueFrom(
          this.httpService
            .get<IGitHubUser>("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "kalamche",
              },
            })
            .pipe(map((res) => res.data)),
        ),

        firstValueFrom(
          this.httpService
            .get<IGitHubUserEmail[]>("https://api.github.com/user/emails", {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "User-Agent": "kalamche",
              },
            })
            .pipe(map((res) => res.data)),
        ),
      ]);

      const primaryEmail = userEmails.find(
        (email) => email.primary && email.verified,
      );
      if (!primaryEmail) {
        throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
      }

      return {
        avatar: user.avatar_url,
        email: primaryEmail.email,
        id: user.id.toString(),
        name: user.name || user.login,
        provider: "github",
        providerId: user.id.toString(),
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.OAuthReqFailed, error);
    }
  }
}
