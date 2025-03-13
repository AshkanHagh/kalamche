import { CacheStrategy } from "src/cache/cache.strategy";
import { PasswordHashStrategy } from "./auth/password.strategy";
import { OAuthManager } from "./auth/oauth-manager";
import { TokenStrategy } from "./auth/token";

export interface CookieOptions {
  name?: string;
  path?: string;
  domain?: string;
  sameSite: "none" | "lax" | "strict" | boolean;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
}

export interface AuthOptions {
  oauthManager?: OAuthManager;
  token: TokenStrategy;
  passwordStrategy: PasswordHashStrategy;

  cookieOptions: CookieOptions;
  oauthOptions?: OAuthOpitons;
  tokenOptions: TokenOptions;
}

export interface TokenOptions {
  atSecret: string;
  rtSecret: string;
  rtExpiry: number;
  atExpiry: number;
  tokenCacheDuration: number;
  tokenAud: string;
  tokenIss: string;
}

export interface OAuthOpitons {
  github: OAuthProviderOpitons;
}

export interface OAuthProviderOpitons {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  tokenHostUrl: string;
  authPath: string;
  tokenPath: string;
  userInfoUrl: string;
  otherInfoUrl: string | undefined;
}

export interface SystemOptions {
  cacheSterategy: CacheStrategy;
}

export interface AppConfig {
  authOptions: AuthOptions;
  systemOpitons: SystemOptions;
}

export interface RuntimeAppConfig extends Required<AppConfig> {
  authOptions: Required<AuthOptions>;
  systemOpitons: Required<SystemOptions>;
}

export interface TestAppConfig extends Partial<AppConfig> {
  authOptions: AuthOptions;
  systemOpitons: SystemOptions;
}
