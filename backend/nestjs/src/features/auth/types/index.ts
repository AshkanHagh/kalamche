import { IUserRecord } from "src/drizzle/types";

export type LoginPendingResponse = {
  token: string;
  verificationEmailSent: boolean;
};

export type LoginResponse = {
  accessToken: string;
  user: IUserRecord;
  verificationEmailSent: boolean;
};

export type VerifyEmailRegistrationRes = {
  accessToken: string;
  user: IUserRecord;
};
