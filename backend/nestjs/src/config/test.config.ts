import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { TestAppConfig, TokenOptions } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/argon2-password.strategy";
import { TokenStrategy } from "./auth/token";

const tokenOptions: TokenOptions = {
  atExpiry: 1000 * 60 * 15,
  atSecret: "test_access_token",
  rtExpiry: 1000 * 60 * 60 * 24 * 2,
  rtSecret: "test_refresh_token",
  tokenIss: "test_iss",
  tokenAud: "test_aud",
  tokenCacheDuration: 60 * 60 * 24 * 2,
};

export const testConfig: TestAppConfig = {
  authOptions: {
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    passwordStrategy: new Argon2PasswordStrategy(),
    token: new TokenStrategy(tokenOptions),
    tokenOptions,
  },

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy("redis://localhost:7301"),
  },
};
