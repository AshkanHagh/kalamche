import { CacheStrategy } from "src/cache/cache.strategy";
import { OAuthProvider } from "./auth/oauth.strategy";
import { PasswordHashStrategy } from "./auth/password.strategy";
import { TokenStrategy } from "./auth/token.strategy";

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
  cookieOptions: CookieOptions;
  oauthProvider: OAuthProvider;
  passwordStrategy: PasswordHashStrategy;

  tokenCacheDuration: number;
  tokenStrategy: TokenStrategy;
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
