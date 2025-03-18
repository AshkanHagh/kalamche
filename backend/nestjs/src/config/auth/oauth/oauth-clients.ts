import { AuthorizationCode } from "simple-oauth2";
import { OAuthProviderOpitons } from "../../app.config";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { CatchError } from "src/common/error/catch-error";
import { BadRequestException, NotFoundException } from "@nestjs/common";

export type OAuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export class OAuthClient {
  public readonly name: string;
  private readonly client: AuthorizationCode;
  private readonly axios: AxiosInstance;
  private readonly userInfoUrl: string;
  private readonly otherInfoUrl: string | undefined;
  private readonly config: OAuthProviderOpitons;

  constructor(config: OAuthProviderOpitons, name: string) {
    this.name = name;
    this.userInfoUrl = config.userInfoUrl;
    this.otherInfoUrl = config.otherInfoUrl;
    this.config = config;

    this.axios = axios.create({
      headers: { "User-Agent": "ashkanHagh/kalamche" },
    });

    this.client = new AuthorizationCode({
      client: {
        id: config.clientId,
        secret: config.clientSecret,
      },
      auth: {
        tokenHost: config.tokenHostUrl,
        authorizePath: config.authPath,
        tokenPath: config.tokenPath,
      },
    });
  }

  public getAuthorizeUrl(provider: string, scopes: string[]): string {
    return this.client.authorizeURL({
      redirect_uri: this.config.redirectUrl,
      scope: scopes,
    });
  }

  public async authentiate(provider: string, code: string): Promise<OAuthUser> {
    try {
      const result = await this.client.getToken({
        code,
        redirect_uri: this.config.redirectUrl,
      });
      const accessToken = result.token.access_token as string;

      const userInfo = await this.axios.get(this.userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const otherInfo = this.otherInfoUrl
        ? await this.axios.get(this.otherInfoUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        : undefined;

      switch (provider) {
        case "github":
          return this.mapGithubUser(userInfo, otherInfo);
        default:
          throw new NotFoundException("oauth provider not found");
      }
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private mapGithubUser(
    userInfoData: AxiosResponse<any, any>,
    otherInfoData: AxiosResponse<any, any> | undefined,
  ): OAuthUser {
    const userInfo = userInfoData as unknown as AxiosResponse<GithubUserInfo>;
    const userEmailsInfo = otherInfoData as unknown as AxiosResponse<
      GithubUserEmailInfo[]
    >;

    const userPrimaryEmail = userEmailsInfo.data.find(
      (email) => email.primary && email.verified,
    );
    if (!userPrimaryEmail) {
      throw new BadRequestException("oauth user has no primary email");
    }

    return {
      id: userInfo.data.id.toString(),
      name: userInfo.data.name,
      avatarUrl: userInfo.data.avatar_url,
      email: userPrimaryEmail.email,
    };
  }
}

type GithubUserInfo = {
  id: number;
  name: string;
  avatar_url: string;
};

type GithubUserEmailInfo = {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: "public" | "private" | null;
};
