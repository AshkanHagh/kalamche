import { IsOptional, IsString } from "class-validator";

export class AuthenticateWIthOAuthDto {
  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  code: string;

  @IsString()
  provider: string;
}
