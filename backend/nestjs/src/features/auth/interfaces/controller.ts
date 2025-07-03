import { RegisterDto, ResendVerificationCodeDto } from "../dto";

export interface IAuthController {
  register(payload: RegisterDto): Promise<{ token: string }>;
  resendVerificationCode(
    payload: ResendVerificationCodeDto,
  ): Promise<{ token: string }>;
}
