import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { RuntimeAppConfig } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";
import { GithubOAuthProvider } from "./auth/github-oauth.strategy";
import { JwtTokenStrategy } from "./auth/jwt-token.strategy";

export const testConfig: RuntimeAppConfig = {
  authOptions: {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    oauthProvider: new GithubOAuthProvider(
      "no_config_on_test",
      "no_config_on_test",
    ),
    passwordStrategy: new Argon2PasswordStrategy(),
    tokenCacheDuration: 60 * 60 * 24 * 7,
    tokenStrategy: new JwtTokenStrategy("atSecret", "rtSecret"),
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy("redis://localhost:7301"),
  },
};
