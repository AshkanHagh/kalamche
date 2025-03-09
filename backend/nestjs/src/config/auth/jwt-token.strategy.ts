import { Injectable } from "@nestjs/common";
import {
  AccessTokenClaims,
  RefreshTokenClaims,
  TokenStrategy,
} from "./token.strategy";
import * as jwt from "jsonwebtoken";

@Injectable()
export class JwtTokenStrategy implements TokenStrategy {
  private readonly refreshTokenSecret: string;
  private readonly accessTokenSecret: string;

  constructor(accessToken: string, refreshToken: string) {
    this.refreshTokenSecret = accessToken;
    this.accessTokenSecret = refreshToken;
  }

  signAccessToken(claims: AccessTokenClaims): string {
    claims.iat = Math.floor(Date.now() / 1000);

    // eslint-disable-next-line
    return jwt.sign(claims, this.accessTokenSecret, {
      expiresIn: "15m",
    });
  }

  signRefreshToken(claims: RefreshTokenClaims): string {
    claims.iat = Math.floor(Date.now() / 1000);

    // eslint-disable-next-line
    return jwt.sign(claims, this.refreshTokenSecret, {
      expiresIn: "7d",
    });
  }

  verifyRefreshToken(token: string): RefreshTokenClaims {
    // eslint-disable-next-line
    const claims = jwt.verify(
      token,
      this.refreshTokenSecret,
    ) as RefreshTokenClaims;
    return claims;
  }

  verifyAccessToken(token: string): AccessTokenClaims {
    // eslint-disable-next-line
    const claims = jwt.verify(
      token,
      this.accessTokenSecret,
    ) as AccessTokenClaims;
    return claims;
  }
}
