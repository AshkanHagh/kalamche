import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { BaseOAuthService } from "./base-oauth.service";
import { IGitHubUser } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { OAUthUserDto } from "../dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GithubOAuthService extends BaseOAuthService {
  constructor(@AuthConfig() private authConfig: IAuthConfig) {
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
      const [userResponse, emailResponse] = await Promise.all([
        fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "kalamche/0.0.1",
          },
        }),
        fetch("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "User-Agent": "kalamche/0.0.1",
          },
        }),
      ]);

      const user = (await userResponse.json()) as IGitHubUser;
      const emails = (await emailResponse.json()) as unknown[];

      const primaryEmail: string = emails.find(
        // eslint-disable-next-line
        (email: any) => email.primary && email.verified,
      ) as string;
      if (!primaryEmail) {
        throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
      }

      return {
        avatar: user.avatar_url,
        email: primaryEmail,
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
