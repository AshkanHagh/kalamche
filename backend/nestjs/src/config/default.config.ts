import { EmailOptions, RuntimeAppConfig } from "./app.config";
import { Argon2PasswordStrategy } from "./auth/password/argon2-password.strategy";
import { OAuthManager } from "./auth/oauth/oauth-manager";
import { NodemailerSendEmail } from "./utils/email";
import { RedisCacheStrategy } from "src/plugin/redis-cache-plugin/redis-cache-strategy";

const oauthProvidersOptions = {
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

const emailOptions: EmailOptions = {
  email: process.env.SMTP_SEND_EMAIL!,
  host: process.env.SMTP_HOST!,
  // port: parseInt(process.env.SMTP_PORT!),
  port: 1025,
  // tls: Boolean(process.env.SMTP_TLS_ENABLED),
  tls: false,
  user: process.env.SMTP_USER || null,
  password: process.env.SMTP_PASSWORD || null,
};

export const defaultConfig: RuntimeAppConfig = {
  authOptions: {
    passwordHashingStrategy: new Argon2PasswordStrategy(),

    oauthProvidersOption: oauthProvidersOptions,
    oauthManager: new OAuthManager(oauthProvidersOptions),

    accessTokenConfig: {
      aud: "kalamche",
      iss: "kalamche",
      secret: process.env.ACCESS_TOKEN_SECRET || "default",
      expireAt: 1000 * 60 * 15,
    },
    refreshTokenConfig: {
      aud: "kalamche",
      iss: "kalamche",
      secret: process.env.REFRESH_TOKEN_SECRET || "default",
      expireAt: 1000 * 60 * 60 * 2,
    },

    verificationTokenConfig: {
      aud: "kalamche",
      iss: "kalamche",
      secret: process.env.VERIFICATION_TOKEN_SECRET || "default",
      expireAt: 1000 * 60 * 15,
    },

    verificationRedirectUrl:
      process.env.VERIFICATION_REDIRECT_URL || "http://localhost:7319",

    cookieConfig: {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 2,
      path: "/",
    },
  },

  emailOptions: new NodemailerSendEmail(emailOptions),

  systemOpitons: {
    cacheStrategy: new RedisCacheStrategy({
      maxItemSizeInBytes: 100000,
      redisOptions: {},
      connectionUrl: process.env.REDIS_URL!,
      namespace: "redis-cache",
    }),
  },
};
