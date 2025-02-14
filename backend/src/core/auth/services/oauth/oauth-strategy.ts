export enum OAuthPlatforms {
  Github = "github",
}

export type OauthUser = {
  email: string;
  avatar_url: string;
  fullname: string;
};

export abstract class OAuthStrategy {
  abstract createOAuthUrl(): string;
  abstract authenticate(code: string): Promise<OauthUser>;
}
