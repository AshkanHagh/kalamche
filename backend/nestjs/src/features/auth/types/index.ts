export type LoginPendingResponse = {
  token: string;
  verificationEmailSent: boolean;
};

export type LoginResponse = {
  // only return in providers for controllers never return refresh token
  refreshToken?: string;
  accessToken: string;
  user: any;
  verificationEmailSent: boolean;
};
