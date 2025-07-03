import { RegisterDto, ResendVerificationCodeDto } from "../dto";

export interface IAuthService {
  register(payload: RegisterDto): Promise<string>;
  resendVerificationCode(payload: ResendVerificationCodeDto): Promise<string>;
}
