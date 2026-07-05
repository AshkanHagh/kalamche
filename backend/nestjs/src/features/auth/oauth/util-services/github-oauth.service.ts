import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { BaseOAuthService } from "./base-oauth.service";
import { GitHubOAuthUser, GitHubOAuthUserEmail, OAuthUser } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Injectable } from "@nestjs/common";
import ky, { KyInstance } from "ky";

@Injectable()
export class GithubOAuthService extends BaseOAuthService {
  private ky: KyInstance;

  constructor(@AuthConfig() authConfig: IAuthConfig) {
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

    this.ky = ky.create({
      prefix: "https://api.github.com",
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
      const [user, userEmails] = await Promise.all([
        this.ky
          .get<GitHubOAuthUser>("user", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .json(),
        this.ky
          .get<GitHubOAuthUserEmail[]>("user/emails", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
          .json(),
      ]);

      const primaryEmail = userEmails.find(
        (email) => email.primary && email.verified,
      );
      if (!primaryEmail) {
        throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
      }

      return {
        providerId: user.id.toString(),
        avatar: user.avatar_url,
        email: primaryEmail.email,
        name: user.name || user.login,
        provider: "github",
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.OAuthReqFailed, error);
    }
  }
}
