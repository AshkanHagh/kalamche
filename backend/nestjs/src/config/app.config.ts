import { PasswordHashStrategy } from "./auth/password/password.strategy";
import { OAuthManager } from "./auth/oauth/oauth-manager";
import { NodemailerSendEmail } from "./utils/email";
import { JwtConfigOptions, OAuthProviderOpitons } from "./auth/types";
import { CacheStrategy } from "./system/cache-strategy";
import { PaymentStrategy } from "./payment/payment-strategy";

export interface AuthOptions {
  cookieConfig: CookieConfig;
  passwordHashingStrategy: PasswordHashStrategy;
  oauthProvidersOption?: {
    github: OAuthProviderOpitons;
  };
  oauthManager?: OAuthManager;
  accessTokenConfig: JwtConfigOptions;
  refreshTokenConfig: JwtConfigOptions;
  verificationTokenConfig: JwtConfigOptions;
  verificationRedirectUrl: string;
}

export interface CookieConfig {
  name?: string;
  path?: string;
  domain?: string;
  sameSite: "none" | "lax" | "strict" | boolean;
  secure?: boolean;
  httpOnly?: boolean;
  maxAge?: number;
  expires?: Date;
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
  cacheStrategy?: CacheStrategy;
}

export interface AppConfig {
  authOptions: AuthOptions;
  emailOptions: NodemailerSendEmail;
  paymentOptions: PaymentStrategy;
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
