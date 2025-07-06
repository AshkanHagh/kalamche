import { Request, Response } from "express";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "../dto";
import {
  LoginPendingResponse,
  LoginResponse,
  VerifyEmailRegistrationRes,
} from "../types";

export interface IAuthService {
  register(payload: RegisterDto): Promise<string>;
  resendVerificationCode(payload: ResendVerificationCodeDto): Promise<string>;
  login(
    req: Request,
    payload: LoginDto,
  ): Promise<LoginPendingResponse | LoginResponse>;

  verifyEmailRegistration(
    res: Response,
    req: Request,
    payload: VerifyEmailRegistrationDto,
  ): Promise<VerifyEmailRegistrationRes>;
}
