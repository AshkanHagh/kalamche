import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { IAuthController } from "./interfaces/controller";
import {
  LoginDto,
  LoginSchema,
  RegisterDto,
  RegisterDtoSchema,
  ResendVerificationCodeDto,
  ResendVerificationCodeSchema,
  VerifyEmailRegistrationDto,
  VerifyEmailRegistrationSchema,
} from "./dto";
import { ZodValidationPipe } from "src/utils/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

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

  @Post("/login")
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body(new ZodValidationPipe(LoginSchema)) payload: LoginDto,
  ): Promise<Response> {
    const result = await this.authService.login(res, req, payload);
    return res.status(200).json(result);
  }

  @Post("/verify")
  async verifyEmailRegistration(
    @Res() res: Response,
    @Req() req: Request,
    @Body(new ZodValidationPipe(VerifyEmailRegistrationSchema))
    payload: VerifyEmailRegistrationDto,
  ): Promise<Response> {
    const result = await this.authService.verifyEmailRegistration(
      res,
      req,
      payload,
    );

    return res.status(201).json(result);
  }

  @Get("/refresh")
  async refreshToken(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    const result = await this.authService.refreshToken(req, res);
    return res.status(200).json(result);
  }
}
