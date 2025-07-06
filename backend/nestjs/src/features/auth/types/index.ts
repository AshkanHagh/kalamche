import { IUserView } from "src/drizzle/types";

export type LoginPendingResponse = {
  token: string;
  verificationEmailSent: boolean;
};

export type LoginResponse = {
  // only return in providers for controllers never return refresh token
  refreshToken?: string;
  accessToken: string;
  user: IUserView;
  verificationEmailSent: boolean;
};

export type VerifyEmailRegistrationRes = {
  accessToken: string;
  user: IUserView;
};
