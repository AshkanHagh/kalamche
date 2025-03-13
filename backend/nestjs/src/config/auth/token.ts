import { UnauthorizedException } from "@nestjs/common";
import * as jwt from "jsonwebtoken";
import { TokenOptions } from "../app.config";

export type AccessTokenClaims = {
  sub: string;
  aud: string;
  iss: string;
  t_type: string;
  scope: string[];
};

export type RefreshTokenClaims = {
  sub: string;
  aud: string;
  iss: string;
  t_type: string;
};

export class TokenStrategy {
  constructor(private readonly config: TokenOptions) {}

  signAccessToken(sub: string, scope: string[]): string {
    const claims: AccessTokenClaims = {
      aud: this.config.tokenAud,
      iss: this.config.tokenIss,
      scope,
      sub,
      t_type: "access",
    };

    return jwt.sign(claims, this.config.atSecret, {
      expiresIn: "15m",
    });
  }

  signRefreshToken(sub: string): string {
    const claims: RefreshTokenClaims = {
      aud: this.config.tokenAud,
      iss: this.config.tokenIss,
      sub,
      t_type: "refresh",
    };

    return jwt.sign(claims, this.config.rtSecret, {
      expiresIn: "2d",
    });
  }

  verifyRefreshToken(token: string): RefreshTokenClaims {
    try {
      const claims = jwt.verify(token, this.config.rtSecret, {
        audience: this.config.tokenAud,
        issuer: this.config.tokenIss,
      }) as RefreshTokenClaims;

      if (claims.t_type !== "refresh") {
        throw new UnauthorizedException("invalid refresh token");
      }

      return claims;
    } catch (error: unknown) {
      if (error instanceof jwt.JsonWebTokenError) {
        // TODO: handle jwt errors by name
        throw new UnauthorizedException("TODO: un handled jwt error");
      }
      // TODO: change error
      throw new UnauthorizedException();
    }
  }
}
