import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { RuntimeAppConfig } from "./app.config";
import { GithubOAuthProvider } from "./auth/github-oauth.strategy";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";

export const defaultConfig: RuntimeAppConfig = {
  authOptions: {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    oauthProvider: new GithubOAuthProvider(
      process.env.GITHUB_CLIENT_ID!,
      process.env.GITHUB_CLIENT_SECRET!,
    ),
    tokenOptions: {
      refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET!,
      accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
      refreshTokenDuration: "2", // in jwt converts to 2 days
      accessTokenDuration: "15", // in jwt converts to 15m
    },
    passwordStrategy: new Argon2PasswordStrategy(),
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy(process.env.REDIS_URL!),
  },
};
