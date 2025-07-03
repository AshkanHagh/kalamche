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
  };
});

export const AuthConfig = () => Inject(authConfig.KEY);
export type IAuthConfig = ConfigType<typeof authConfig>;
