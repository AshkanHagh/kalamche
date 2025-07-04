import { Request } from "express";
import { LoginDto, RegisterDto, ResendVerificationCodeDto } from "../dto";
import { LoginPendingResponse, LoginResponse } from "../types";

export interface IAuthService {
  register(payload: RegisterDto): Promise<string>;
  resendVerificationCode(payload: ResendVerificationCodeDto): Promise<string>;
  login(
    req: Request,
    payload: LoginDto,
  ): Promise<LoginPendingResponse | LoginResponse>;
}
