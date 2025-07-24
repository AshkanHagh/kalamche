import { ConfigType, registerAs } from "@nestjs/config";
import { AUTH_CONFIG } from "./constants";
import { Inject } from "@nestjs/common";

export const authConfig = registerAs(AUTH_CONFIG, () => {
  return {
    verificationToken: {
      secret: process.env.VERIFICATION_TOKEN_SECRET,
      // 10m in seconds
      exp: 60 * 10,
    },
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      // 30m in seconds
      exp: 60 * 30,
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      // 7d in seconds
      exp: 60 * 60 * 24 * 7,
    },
    oauth: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        redirectUri: process.env.GITHUB_REDIRECT_URI!,
      },
      discord: {
        clientId: process.env.DISCORD_CLIENT_ID!,
        clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        redirectUri: process.env.DISCORD_REDIRECT_URI!,
      },
    },
  };
});

export const AuthConfig = () => Inject(authConfig.KEY);
export type IAuthConfig = ConfigType<typeof authConfig>;
