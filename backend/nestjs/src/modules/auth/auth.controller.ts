import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "./dto";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("/register")
  async register(@Body() payload: RegisterDto): Promise<{ token: string }> {
    const token = await this.authService.register(payload);
    return {
      token,
    };
  }

  @Post("/verify/resend")
  async resendVerificationCode(
    @Body() payload: ResendVerificationCodeDto,
  ): Promise<{ token: string }> {
    const token = await this.authService.resendVerificationCode(payload);
    return {
      token,
    };
  }

  @Post("/login")
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() payload: LoginDto,
  ) {
    return await this.authService.login(res, req, payload);
  }

  @Post("/verify")
  @HttpCode(HttpStatus.CREATED)
  async verifyEmailRegistration(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
    @Body() payload: VerifyEmailRegistrationDto,
  ) {
    return await this.authService.verifyEmailRegistration(res, req, payload);
  }

  @Get("/refresh")
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return await this.authService.refreshToken(req, res);
  }
}
