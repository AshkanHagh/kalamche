import { PasswordHashStrategy } from "./auth/password/password.strategy";
import { OAuthManager } from "./auth/oauth/oauth-manager";
import { NodemailerSendEmail } from "./utils/email";
import { JwtConfigOptions, OAuthProviderOpitons } from "./auth/types";
import { CacheStrategy } from "./system/cache-strategy";

/**
 * @description
 * Defines how authentication and authorization are managed within the application.
 */
export interface AuthOptions {
  /**
   * @description
   * Configuration options for handling cookies when using the 'cookie' token method.
   */
  cookieConfig: CookieConfig;

  /**
   * @description
   * The strategy used for hashing passwords before storing them.
   */
  passwordHashingStrategy: PasswordHashStrategy;

  /**
   * @description
   * Configuration options for OAuth authentication providers.
   */
  oauthProvidersOption?: {
    /**
     * @description
     * Configuration options for GitHub OAuth authentication.
     */
    github: OAuthProviderOpitons;
  };

  /**
   * @description
   * Manages OAuth authentication and handles provider interactions.
   */
  oauthManager?: OAuthManager;

  /**
   * @description
   * Configuration for access token generation and validation.
   */
  accessTokenConfig: JwtConfigOptions;

  /**
   * @description
   * Configuration for refresh token generation and validation.
   */
  refreshTokenConfig: JwtConfigOptions;

  /**
   * @description
   * Configuration for verification token generation and validation.
   */
  verificationTokenConfig: JwtConfigOptions;

  /**
   * @description
   * The URL where users are redirected after verifying their email or phone number.
   */
  verificationRedirectUrl: string;
}

/**
 * @description
 * Configuration options for handling authentication cookies.
 */
export interface CookieConfig {
  /**
   * @description
   * The name of the cookie.
   */
  name?: string;

  /**
   * @description
   * The path for which the cookie is valid.
   */
  path?: string;

  /**
   * @description
   * The domain for which the cookie is valid.
   */
  domain?: string;

  /**
   * @description
   * Specifies how cookies should be sent with cross-site requests.
   */
  sameSite: "none" | "lax" | "strict" | boolean;

  /**
   * @description
   * If true, the cookie is only sent over HTTPS.
   */
  secure?: boolean;

  /**
   * @description
   * If true, the cookie is only accessible via HTTP(S) requests and not JavaScript.
   */
  httpOnly?: boolean;

  /**
   * @description
   * The maximum age of the cookie in seconds.
   */
  maxAge?: number;

  /**
   * @description
   * The expiration date of the cookie.
   */
  expires?: Date;
}

/**
 * @description
 * Configuration options for sending emails.
 */
export interface EmailOptions {
  /**
   * @description
   * The email address used for sending emails.
   */
  email: string;

  /**
   * @description
   * The SMTP host used for sending emails.
   */
  host: string;

  /**
   * @description
   * The port used for SMTP connections.
   */
  port: number;

  /**
   * @description
   * Whether TLS encryption is required for email communication.
   */
  tls: boolean;

  /**
   * @description
   * The username for SMTP authentication.
   */
  user: string | null;

  /**
   * @description
   * The password for SMTP authentication.
   */
  password: string | null;
}

/**
 * @description
 * Options related to system functions and configurations.
 */
export interface SystemOptions {
  /**
   * @description
   * The underlying method used to store cache key-value pairs, powering the {@link CacheService}.
   */
  cacheStrategy?: CacheStrategy;
}

/**
 * @description
 * Main configuration object for the application.
 */
export interface AppConfig {
  /**
   * @description
   * Authentication-related configuration.
   */
  authOptions: AuthOptions;

  /**
   * @description
   * Email service configuration.
   */
  emailOptions: NodemailerSendEmail;

  /**
   * @description
   * System-related configuration.
   */
  systemOpitons: SystemOptions;
}

/**
 * @description
 * The fully resolved application configuration at runtime, ensuring all fields are set.
 */
export interface RuntimeAppConfig extends Required<AppConfig> {
  /**
   * @description
   * Fully resolved authentication options.
   */
  authOptions: Required<AuthOptions>;

  /**
   * @description
   * Fully resolved email options.
   */
  emailOptions: NodemailerSendEmail;

  /**
   * @description
   * Fully resolved system options.
   */
  systemOpitons: Required<SystemOptions>;
}

/**
 * @description
 * Configuration used for testing, allowing optional overrides.
 */
export interface TestAppConfig extends Partial<AppConfig> {
  /**
   * @description
   * Authentication options for the test environment.
   */
  authOptions: AuthOptions;

  /**
   * @description
   * Email service configuration for the test environment.
   */
  emailOptions: NodemailerSendEmail;

  /**
   * @description
   * System options for the test environment.
   */
  systemOpitons: SystemOptions;
}
