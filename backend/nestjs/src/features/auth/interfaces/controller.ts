import { Request, Response } from "express";
import { LoginDto, RegisterDto, ResendVerificationCodeDto } from "../dto";

export interface IAuthController {
  register(payload: RegisterDto): Promise<{ token: string }>;
  resendVerificationCode(
    payload: ResendVerificationCodeDto,
  ): Promise<{ token: string }>;

  login(req: Request, res: Response, payload: LoginDto): Promise<Response>;
}
