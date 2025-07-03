import { Body, Controller, Post } from "@nestjs/common";
import { IAuthController } from "./interfaces/controller";
import {
  RegisterDto,
  RegisterDtoSchema,
  ResendVerificationCodeDto,
  ResendVerificationCodeSchema,
} from "./dto";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController implements IAuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) payload: RegisterDto,
  ): Promise<{ token: string }> {
    const verificationToken = await this.authService.register(payload);
    return { token: verificationToken };
  }

  @Post("/verify/resend")
  async resendVerificationCode(
    @Body(new ZodValidationPipe(ResendVerificationCodeSchema))
    payload: ResendVerificationCodeDto,
  ): Promise<{ token: string }> {
    const verificationToken =
      await this.authService.resendVerificationCode(payload);
    return { token: verificationToken };
  }
}
