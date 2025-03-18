import { CacheStrategy } from "src/cache/cache.strategy";
import { PasswordHashStrategy } from "./auth/password/password.strategy";
import { OAuthManager } from "./auth/oauth/oauth-manager";
import { TokenStrategy } from "./auth/token";
import { NodemailerSendEmail } from "./utils/email";

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
  verificationRedirectUrl: string;
}

export interface TokenOptions {
  atSecret: string;
  rtSecret: string;
  rtExpiry: number;
  atExpiry: number;
  tokenAud: string;
  tokenIss: string;
  tokenCacheDuration: number;
  verificationSecret: string;
  verificationExpiry: number;
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

export interface EmailOptions {
  email: string;
  host: string;
  port: number;
  tls: boolean;
  user: string | null;
  password: string | null;
}

export interface SystemOptions {
  cacheSterategy: CacheStrategy;
}

export interface AppConfig {
  authOptions: AuthOptions;
  emailOptions: NodemailerSendEmail;
  systemOpitons: SystemOptions;
}

export interface RuntimeAppConfig extends Required<AppConfig> {
  authOptions: Required<AuthOptions>;
  emailOptions: NodemailerSendEmail;
  systemOpitons: Required<SystemOptions>;
}

export interface TestAppConfig extends Partial<AppConfig> {
  authOptions: AuthOptions;
  emailOptions: NodemailerSendEmail;
  systemOpitons: SystemOptions;
}
