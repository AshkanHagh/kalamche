import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { GetOAuthUrlDto, getOAuthUrlDto } from "./dto/get-oauth-url.dto";
import { AuthService } from "./auth.service";
import { OAuthCallbackDto, oAuthCallbackDto } from "./dto/oauth-callback.dto";
import { TokenService } from "./services/token/jwt";
import { Response } from "express";
import { buildCookie } from "./utils/cookie";
import { ZodValidationPipe } from "src/common/utils/zod-validation.pipe";

const REFRESH_TOKEN_COOKIE_NAME: string = "refresh_token";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Get("/oauth/callback")
  async oAuthCallback(
    @Res() res: Response,
    @Query(new ZodValidationPipe(oAuthCallbackDto)) query: OAuthCallbackDto,
  ) {
    const oauthUser = await this.authService.authenticateOAuthCallback(
      query.code,
      query.oauth,
    );
    const user = await this.authService.register(oauthUser);

    const accessToken = this.tokenService.signAccessToken(user.id);
    const refreshToken = this.tokenService.signRefreshToken(user.id);

    await this.authService.updateUserRefreshToken(user.id, refreshToken);

    const cookie = buildCookie();
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken, cookie);

    res.status(201).json({
      success: true,
      user,
      accessToken,
    });
  }

  @Get("oauth/:oauth")
  getOAuthUrl(
    @Param(new ZodValidationPipe(getOAuthUrlDto)) params: GetOAuthUrlDto,
  ) {
    const url = this.authService.getOAuthUrl(params.oauth);
    return { url };
  }
}
