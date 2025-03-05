import { ConfigService } from "@nestjs/config";
import { AuthorizationCode } from "simple-oauth2";
import axios, { AxiosError, AxiosResponse } from "axios";
import { BadRequestException, HttpException, Injectable } from "@nestjs/common";
import { CatchError } from "src/shared/catch-error";
import {
  OAuthProvider,
  OAuthUser,
} from "src/core/interfaces/oauth-provider.interface";

@Injectable()
export class GithubOAuthProvider implements OAuthProvider {
  private readonly client: AuthorizationCode;

  constructor(private readonly config: ConfigService) {
    const CLIENT_ID: string = this.config.getOrThrow("GITHUB_CLIENT_ID");
    const CLIENT_SECRET: string = this.config.getOrThrow(
      "GITHUB_CLIENT_SECRET",
    );

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

  public createAuthUrl(): string {
    return this.client.authorizeURL({
      redirect_uri: "http://localhost:7319/auth/oauth/callback",
      scope: ["read:user", "user:email"],
    });
  }

  public async authenticate(code: string): Promise<OAuthUser> {
    try {
      const accessToken = await this.client.getToken({
        code,
        redirect_uri: "http://localhost:7319/auth/oauth/callback",
      });

      const token = accessToken.token.access_token as string;
      return await this.getUserInfo(token);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private async getUserInfo(accessToken: string): Promise<OAuthUser> {
    try {
      const [userResponse, emailResponse]: [
        AxiosResponse<GitHubUser>,
        AxiosResponse<GithubUserEmail[]>,
      ] = await Promise.all([
        axios.get<GitHubUser>("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),

        axios.get<GithubUserEmail[]>("https://api.github.com/user/emails", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ]);

      const userPrimaryEmail = emailResponse.data.find(
        (email) => email.primary && email.verified,
      );
      if (!userPrimaryEmail) {
        throw new BadRequestException("could not find primary email");
      }

      return {
        name: userResponse.data.name,
        email: userPrimaryEmail.email,
        imageUrl: userResponse.data.avatar_url,
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new HttpException(error.message, error.status || 500);
      }
      throw CatchError(error);
    }
  }
}

type GitHubUser = {
  id: number;
  avatar_url: string;
  name: string;
};

type GithubUserEmail = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
};
