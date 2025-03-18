import { RedisCacheStrategy } from "src/cache/redis-cache.strategy";
import { EmailOptions, TestAppConfig, TokenOptions } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/password/argon2-password.strategy";
import { TokenStrategy } from "./auth/token";
import { NodemailerSendEmail } from "./utils/email";

const tokenOptions: TokenOptions = {
  atExpiry: 1000 * 60 * 15,
  atSecret: "test_access_token",
  rtExpiry: 1000 * 60 * 60 * 24 * 2,
  rtSecret: "test_refresh_token",
  tokenIss: "test_iss",
  tokenAud: "test_aud",
  tokenCacheDuration: 60 * 60 * 24 * 2,
  verificationExpiry: 1000 * 60 * 15,
  verificationSecret: "test_verification_secret",
};

const emailOptions: EmailOptions = {
  email: "test.email@example.com",
  host: "localhost",
  port: 1025,
  tls: false,
  user: "",
  password: "",
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
    verificationRedirectUrl: "http://localhost:7319/auth/email/verify",
  },

  emailOptions: new NodemailerSendEmail(emailOptions),

  systemOpitons: {
    cacheSterategy: new RedisCacheStrategy("redis://localhost:7301"),
  },
};
