import { ConfigType, registerAs } from "@nestjs/config";
import { AUTH_CONFIG } from "./constants";
import { Inject } from "@nestjs/common";

export const authConfig = registerAs(AUTH_CONFIG, () => {
  return {
    verificationToken: {
      secret: process.env.VERIFICATION_TOKEN_SECRET,
      // 10m
      exp: 60 * 10,
    },
    accessToken: {
      secret: process.env.ACCESS_TOKEN_SECRET,
      // 30m
      exp: 60 * 30,
    },
    refreshToken: {
      secret: process.env.REFRESH_TOKEN_SECRET,
      // 7d
      exp: 60 * 60 * 24 * 7,
    },
  };
});

export const AuthConfig = () => Inject(authConfig.KEY);
export type IAuthConfig = ConfigType<typeof authConfig>;
