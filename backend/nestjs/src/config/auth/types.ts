/**
 * @description
 * Configuration options for JWT authentication and token generation.
 */
export interface JwtConfigOptions {
  /**
   * @description
   * The audience for the JWT token, typically the intended recipient(s) of the token.
   */
  aud: string;

  /**
   * @description
   * The issuer of the JWT token, usually the service generating the token.
   */
  iss: string;

  /**
   * @description
   * The secret key used for signing and verifying the JWT token.
   * Ensure this is kept secure and not exposed in client-side code.
   */
  secret: string;

  /**
   * @description
   * The duration (in milliseconds) for which the token remains valid before expiring.
   */
  expireAt: number;
}

/**
 * @description
 * Base claims included in all JWT tokens.
 */
export interface BaseTokenClaims {
  /**
   * @description
   * The subject of the token, usually the unique identifier of the user.
   */
  sub: string;

  /**
   * @description
   * The audience for the JWT token, specifying the intended recipient(s).
   */
  aud: string;

  /**
   * @description
   * The issuer of the JWT token, identifying the entity that issued the token.
   */
  iss: string;

  /**
   * @description
   * The expiration timestamp (in seconds since the Unix epoch) when the token becomes invalid.
   */
  exp: number;

  /**
   * @description
   * The type of the token (e.g., `access`, `refresh`, `verification`).
   */
  t_type: string;
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
