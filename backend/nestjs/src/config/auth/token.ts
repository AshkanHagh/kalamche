import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { BaseTokenClaims, JwtConfigOptions } from "./types";
import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/kalamche-error";

export interface AccessTokenClaims extends BaseTokenClaims {
  scope: string[];
}

// eslint-disable-next-line
export interface RefreshTokenClaims extends BaseTokenClaims {}

/**
 * @description
 * Claims specific to a verification token, typically used for email verification.
 */
export interface VerificationTokenClaims extends BaseTokenClaims {
  /**
   * @description
   * The verification code associated with the token.
   */
  code: string;
}

export function signAccessToken(
  config: JwtConfigOptions,
  sub: number,
  scope: string[],
): string {
  const claims: AccessTokenClaims = buildClaims(config, sub, "ACCESS", {
    scope,
  });
  return jwt.sign(claims, config.secret);
}

export function signRefreshToken(
  config: JwtConfigOptions,
  sub: number,
): string {
  const claims: RefreshTokenClaims = buildClaims(config, sub, "REFRESH", {});
  return jwt.sign(claims, config.secret);
}

export function signVerificationToken(
  config: JwtConfigOptions,
  sub: number,
  code: string,
): string {
  const claims: VerificationTokenClaims = buildClaims(config, sub, "VERIFY", {
    code,
  });
  return jwt.sign(claims, config.secret);
}

export function verifyToken<T extends BaseTokenClaims>(
  config: JwtConfigOptions,
  type: "REFRESH" | "ACCESS" | "VERIFY",
  token: string,
): T {
  const claims = decodeToken<T>(config, token);
  if (claims.t_type !== type) {
    throw new UnauthorizedException("invalid refresh token");
  }

  return claims;
}

/**
 * @description
 * Builds JWT claims based on the provided configuration, subject, and token type.
 *
 * @template T - Additional claims specific to the token type.
 *
 * @param {JwtConfigOptions} config - The JWT configuration containing issuer, audience, and expiration settings.
 * @param {string} sub - The subject of the token, usually the unique user identifier.
 * @param {"REFRESH" | "ACCESS" | "VERIFY"} type - The type of the token, defining its purpose.
 * @param {T} extra - Additional claims specific to the token type.
 *
 * @returns {T & BaseTokenClaims} - A complete set of JWT claims including both base and extra claims.
 */
function buildClaims<T>(
  config: JwtConfigOptions,
  sub: number,
  type: "REFRESH" | "ACCESS" | "VERIFY",
  extra: T,
): T & BaseTokenClaims {
  const claims: T & BaseTokenClaims = {
    aud: config.aud,
    iss: config.iss,
    sub,
    exp: Math.floor(Date.now() + config.expireAt / 1000),
    t_type: type,
    ...extra,
  };

  return claims;
}

function decodeToken<T>(config: JwtConfigOptions, token: string): T {
  try {
    const claims = jwt.verify(token, config.secret, {
      audience: config.aud,
      issuer: config.iss,
    }) as T;

    return claims;
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) {
      switch (error.name) {
        case "TokenExpiredError": {
          throw new KalamcheError(KalamcheErrorType.TokenExpired);
        }
        case "JsonWebTokenError": {
          throw new KalamcheError(KalamcheErrorType.InvalidToken);
        }
        default: {
          throw new KalamcheError(KalamcheErrorType.InvalidToken);
        }
      }
    }

    throw new KalamcheError(KalamcheErrorType.InvalidToken);
  }
}
