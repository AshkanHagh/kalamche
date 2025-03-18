import { UserRecord } from "src/drizzle/schema";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class AuthenticateWIthOAuthDto {
  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  code: string;

  @IsString()
  provider: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyEmailRegistratonDto {
  @IsString()
  token: string;

  @IsString()
  code: string;
}

export type GetAuthorizeUrlResponse = {
  success: boolean;
  url: string;
};

// base response type for all login-related operations
export type LoginResponse = {
  success: boolean;
  accessToken: string;
  user: UserRecord;
};

export type RefreshTokenResponse = {
  success: boolean;
  accessToken: string;
};
