import { ConfigService } from "@nestjs/config";
import { OAuthStrategy, OauthUser } from "./oauth-strategy";
import { AuthorizationCode } from "simple-oauth2";
import axios, { AxiosResponse } from "axios";
import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { CatchError } from "src/common/utils/error";

@Injectable()
export class GithubOauthSterategy implements OAuthStrategy {
  private readonly client: AuthorizationCode;

  constructor(private readonly config: ConfigService) {
    const CLIENT_ID = this.config.get<string>("GITHUB_CLIENT_ID")!;
    const CLIENT_SECRET = this.config.get<string>("GITHUB_CLIENT_SECRET")!;

    this.client = new AuthorizationCode({
      client: {
        id: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      auth: {
        tokenHost: "https://github.com",
        tokenPath: "/login/oauth/access_token",
        authorizePath: "/login/oauth/authorize",
      },
    });
  }

  public createOAuthUrl(): string {
    const url = this.client.authorizeURL({
      redirect_uri: "http://localhost:7319/auth/oauth/callback",
      scope: ["read:user", "user:email"],
    });

    return url;
  }

  public async authenticate(code: string): Promise<OauthUser> {
    try {
      const accessToken = await this.client.getToken({
        code,
        redirect_uri: "http://localhost:7319/auth/oauth/callback",
      });

      const token = accessToken.token.access_token as string;
      const user = await this.getGithubUser(token);

      return user;
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private async getGithubUser(accessToken: string): Promise<OauthUser> {
    try {
      const [userResponse, emailResponse]: [
        AxiosResponse<GitHubUser>,
        AxiosResponse<GithubUserEmail[]>,
      ] = await Promise.all([
        await axios.get<GitHubUser>("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),

        await axios.get("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      const userPrimaryEmail = emailResponse.data.find(
        (obj) => obj.primary && obj.verified,
      );
      if (!userPrimaryEmail) {
        throw new BadRequestException("Email not found");
      }

      return {
        email: userPrimaryEmail.email,
        fullname: userResponse.data.name,
        avatar_url: userResponse.data.avatar_url,
      };
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(error.message, error.status ?? 500);
      }
      throw CatchError(error);
    }
  }
}

type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name: string;
  company: string | null;
  blog: string;
  location: string;
  email: string | null;
  hireable: boolean | null;
  bio: string;
  twitter_username: string | null;
  notification_email: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  two_factor_authentication: boolean;
  plan: {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
  };
};

type GithubUserEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
};
