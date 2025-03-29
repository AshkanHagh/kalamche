import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "src/config/config.service";
import { AuthService } from "src/service/services/auth.service";
import {
  AuthenticateWIthOAuthDto,
  GetAuthorizeUrlResponse,
  LoginResponse,
  RefreshTokenResponse,
  RegisterDto,
  SignupResponse,
  VerifyEmailRegistratonDto,
} from "../common/auth-generated-types";
import { REFRESH_TOKEN_COOKIE_NAME } from "../common/shared-constants";
import { RateLimit } from "../decorators/rate-limit.decorators";
import { ActionType } from "src/config/rate-limit/rate-limit.service";
import { RateLimitInterceptor } from "../interceptors/rate-limit.interceptor";

@Controller("auth")
@UseInterceptors(RateLimitInterceptor)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get("/oauth")
  @RateLimit(ActionType.REGISTER)
  public getAuthorizeUrl(
    @Query("provider") query: string,
  ): GetAuthorizeUrlResponse {
    const url = this.config.authOptions.oauthManager?.getAuthorizeUrl(query);
    return { success: true, url: url! };
  }

  @Get("/oauth/callback")
  @RateLimit(ActionType.REGISTER)
  public async authenticateWithOAuth(
    @Query() query: AuthenticateWIthOAuthDto,
    @Res() response: Response,
  ) {
    const oauthUser = await this.config.authOptions.oauthManager?.authenticate(
      query.provider,
      query.code,
    );
    const result = await this.authService.authenticateWithOAuth(oauthUser!);

    response
      .status(201)
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        result.refreshToken,
        this.config.authOptions.cookieConfig,
      )
      .json(<LoginResponse>{
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
  }

  @Get("/token/refresh")
  @RateLimit(ActionType.REGISTER)
  public async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies["refresh_token"] as string | undefined;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshToken(refreshToken);

    res
      .status(200)
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        tokens.refreshToken,
        this.config.authOptions.cookieConfig,
      )
      .json(<RefreshTokenResponse>{
        success: true,
        accessToken: tokens.accessToken,
      });
  }

  @Post("/signup")
  @RateLimit(ActionType.REGISTER)
  public async signup(@Body() payload: RegisterDto): Promise<SignupResponse> {
    const token = await this.authService.register(payload);
    return {
      success: true,
      verificationToken: token,
    };
  }

  @Post("/email/verify")
  @RateLimit(ActionType.REGISTER)
  public async verifyEmailRegistration(
    @Res() res: Response,
    @Body() payload: VerifyEmailRegistratonDto,
  ) {
    const user = await this.authService.verifyEmailRegistration(payload);

    res
      .status(201)
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        user.refreshToken,
        this.config.authOptions.cookieConfig,
      )
      .json(<LoginResponse>{
        success: true,
        user: user.user,
        accessToken: user.accessToken,
      });
  }

  @Post("/signin")
  @RateLimit(ActionType.REGISTER)
  public async signin(@Res() res: Response, @Body() payload: RegisterDto) {
    const result = await this.authService.login(payload);

    if (typeof result === "string") {
      return res.status(200).json(<SignupResponse>{
        success: true,
        verificationToken: result,
      });
    }

    return res
      .status(201)
      .cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        result.refreshToken,
        this.config.authOptions.cookieConfig,
      )
      .json(<LoginResponse>{
        success: true,
        user: result.user,
        accessToken: result.accessToken,
      });
  }
}
