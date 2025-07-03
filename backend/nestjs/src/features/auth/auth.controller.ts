import { Body, Controller, Post } from "@nestjs/common";
import { IAuthController } from "./interfaces/controller";
import { RegisterDto, RegisterDtoSchema } from "./dto";
import { RegisterResponse } from "./types";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController implements IAuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(
    @Body(new ZodValidationPipe(RegisterDtoSchema)) payload: RegisterDto,
  ): Promise<RegisterResponse> {
    const verificationToken = await this.authService.register(payload);
    return { verificationToken };
  }
}
