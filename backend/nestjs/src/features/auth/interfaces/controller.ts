import { Request, Response } from "express";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "../dto";

export interface IAuthController {
  register(payload: RegisterDto): Promise<{ token: string }>;
  resendVerificationCode(
    payload: ResendVerificationCodeDto,
  ): Promise<{ token: string }>;

  login(req: Request, res: Response, payload: LoginDto): Promise<Response>;

  verifyEmailRegistration(
    res: Response,
    req: Request,
    payload: VerifyEmailRegistrationDto,
  ): Promise<Response>;
}
