import { EmailOptions, TestAppConfig } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/password/argon2-password.strategy";
import { NodemailerSendEmail } from "./utils/email";
import { RedisCacheStrategy } from "src/plugin/redis-cache-plugin/redis-cache-strategy";

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
    passwordHashingStrategy: new Argon2PasswordStrategy(),

    accessTokenConfig: {
      aud: "test_kalamche",
      iss: "test_kalamche",
      secret: "test_default",
      expireAt: 1000 * 60 * 15,
    },
    refreshTokenConfig: {
      aud: "test_kalamche",
      iss: "test_kalamche",
      secret: "test_default",
      expireAt: 1000 * 60 * 60 * 2,
    },

    verificationTokenConfig: {
      aud: "test_kalamche",
      iss: "test_kalamche",
      secret: "test_default",
      expireAt: 1000 * 60 * 15,
    },

    verificationRedirectUrl: "http://localhost:7319",

    cookieConfig: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
      path: "/",
    },
  },

  emailOptions: new NodemailerSendEmail(emailOptions),

  // add mock connection
  systemOpitons: {
    cacheStrategy: new RedisCacheStrategy({
      maxItemSizeInBytes: 100000,
      redisOptions: {
        monitor: true,
        lazyConnect: true,
      },
      connectionUrl: process.env.REDIS_URL!,
      namespace: "redis-cache",
    }),
  },
};
