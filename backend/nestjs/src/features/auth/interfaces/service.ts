import { Request, Response } from "express";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "../dto";

export interface IAuthService {
  register(payload: RegisterDto): Promise<string>;
  resendVerificationCode(payload: ResendVerificationCodeDto): Promise<string>;
  login(res: Response, req: Request, payload: LoginDto): Promise<unknown>;

  verifyEmailRegistration(
    res: Response,
    req: Request,
    payload: VerifyEmailRegistrationDto,
  ): Promise<unknown>;
  refreshToken(req: Request, res: Response): Promise<{ accessToken: string }>;
}
