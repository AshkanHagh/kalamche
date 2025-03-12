import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { OAuthOpitons, RuntimeAppConfig } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";
import { JwtTokenStrategy } from "./auth/jwt-token.strategy";
import { OAuthManager } from "./auth/oauth-manager";

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

export const defaultConfig: RuntimeAppConfig = {
  authOptions: {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    oauthOptions,
    oauthManager: new OAuthManager(oauthOptions),
    passwordStrategy: new Argon2PasswordStrategy(),
    tokenCacheDuration: 60 * 60 * 24 * 7,
    tokenStrategy: new JwtTokenStrategy(
      process.env.ACCESS_TOKEN_SECRET!,
      process.env.REFRESH_TOKEN_SECRET!,
    ),
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy(
      process.env.REDIS_URL || "redis://localhost:7301",
    ),
  },
};
