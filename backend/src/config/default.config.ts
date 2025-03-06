import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { RuntimeAppConfig } from "./app.config";
import { GithubOAuthProvider } from "./auth/github-oauth.strategy";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";
import { JwtTokenStrategy } from "./auth/jwt-token.strategy";

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
    passwordStrategy: new Argon2PasswordStrategy(),
    tokenCacheDuration: 60 * 60 * 24 * 7,
    tokenStrategy: new JwtTokenStrategy(),
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy(process.env.REDIS_URL!),
  },
};
