import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { OAuthOpitons, RuntimeAppConfig, TokenOptions } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";
import { OAuthManager } from "./auth/oauth-manager";
import { TokenStrategy } from "./auth/token";

const oauthOptions: OAuthOpitons = {
  github: {
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUrl: process.env.GITHUB_REDIRECT_URL!,
    tokenHostUrl: "https://github.com",
    authPath: "/login/oauth/authorize",
    tokenPath: "/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    otherInfoUrl: "https://api.github.com/user/emails",
  },
};

const tokenOptions: TokenOptions = {
  atExpiry: 1000 * 60 * 15,
  atSecret: process.env.ACCESS_TOKEN_SECRET!,
  rtExpiry: 1000 * 60 * 60 * 24 * 2,
  rtSecret: process.env.REFRESH_TOKEN_SECRET!,
  tokenIss: "Kalamche",
  tokenAud: "Kalamche",
  tokenCacheDuration: 60 * 60 * 24 * 2,
};

export const defaultConfig: RuntimeAppConfig = {
  authOptions: {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    oauthManager: new OAuthManager(oauthOptions),
    passwordStrategy: new Argon2PasswordStrategy(),
    oauthOptions,
    tokenOptions,
    token: new TokenStrategy(tokenOptions),
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy(
      process.env.REDIS_URL || "redis://localhost:7301",
    ),
  },
};
