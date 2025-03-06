import { Controller, Get, Query, Res } from "@nestjs/common";
import { Response } from "express";
import { ConfigService } from "src/config/config.service";
import { AuthService } from "src/service/services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get("/oauth")
  public getAuthUrl() {
    const url = this.config.authOptions.oauthProvider.createAuthUrl();
    return { url };
  }

  @Get("/oauth/callback1")
  public async oauthCallback(
    @Query("code") query: string,
    @Res() response: Response,
  ) {
    const oauthUser =
      await this.config.authOptions.oauthProvider.authenticate(query);
    const result = await this.authService.oauthRegister(oauthUser);

    response
      .status(201)
      .cookie(
        "refresh_token",
        result.refreshToken,
        this.config.authOptions.cookieOptions,
      )
      .json({
        success: true,
        accessToken: result.accessToken,
        user: result.user,
      });
  }
}
