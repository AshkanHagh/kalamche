import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { TokenOptions } from "../app.config";

export type AccessTokenClaims = {
  sub: string;
  aud: string;
  iss: string;
  exp: number;
  t_type: string;
  scope: string[];
};

export type RefreshTokenClaims = {
  sub: string;
  aud: string;
  iss: string;
  exp: number;
  t_type: string;
};

export type VerificationTokenClaims = {
  sub: string;
  code: string;
  aud: string;
  exp: number;
  iss: string;
  t_type: string;
};

export class TokenStrategy {
  constructor(private readonly config: TokenOptions) {}

  public signAccessToken(sub: string, scope: string[]): string {
    const claims: AccessTokenClaims = {
      aud: this.config.tokenAud,
      iss: this.config.tokenIss,
      scope,
      sub,
      exp: Math.floor(Date.now() / 1000) + this.config.atExpiry,
      t_type: "access",
    };

    return jwt.sign(claims, this.config.atSecret);
  }

  public signRefreshToken(sub: string): string {
    const claims: RefreshTokenClaims = {
      aud: this.config.tokenAud,
      iss: this.config.tokenIss,
      sub,
      exp: Math.floor(Date.now() / 1000) + this.config.rtExpiry,
      t_type: "refresh",
    };

    return jwt.sign(claims, this.config.rtSecret);
  }

  public signVerificationToken(sub: string, code: string): string {
    const claims: VerificationTokenClaims = {
      aud: this.config.tokenAud,
      iss: this.config.tokenIss,
      sub,
      code,
      exp: Math.floor(Date.now() / 1000) + this.config.verificationExpiry,
      t_type: "verification",
    };

    return jwt.sign(claims, this.config.verificationSecret);
  }

  public verifyRefreshToken(token: string): RefreshTokenClaims {
    const claims = this.decodeToken<RefreshTokenClaims>(token);

    if (claims.t_type !== "refresh") {
      throw new UnauthorizedException("invalid refresh token");
    }

    return claims;
  }

  public verifyVerificationToken(token: string): VerificationTokenClaims {
    const claims = this.decodeToken<VerificationTokenClaims>(token);

    if (claims.t_type != "verification") {
      throw new UnauthorizedException("invalid verification token");
    }

    return claims;
  }

  private decodeToken<T>(token: string): T {
    try {
      const claims = jwt.verify(token, this.config.rtSecret, {
        audience: this.config.tokenAud,
        issuer: this.config.tokenIss,
      }) as T;

      return claims;
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError) {
        switch (error.name) {
          case "TokenExpiredError":
            throw new UnauthorizedException("Token expired.");

          case "JsonWebTokenError":
            throw new UnauthorizedException("Invalid token.");

          default:
            throw new UnauthorizedException("JWT verification failed.");
        }
      }

      throw new UnauthorizedException("Access denied.");
    }
  }
}
