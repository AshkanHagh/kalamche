export type AccessTokenClaims = {
  sub: string;
  permissions: string[];
  iat?: number;
};

export type RefreshTokenClaims = {
  sub: string;
  iat?: number;
};

export interface TokenStrategy {
  signRefreshToken(claims: RefreshTokenClaims): string;
  signAccessToken(claims: AccessTokenClaims): string;
  verifyRefreshToken(token: string): RefreshTokenClaims;
  verifyAccessToken(token: string): AccessTokenClaims;
}
