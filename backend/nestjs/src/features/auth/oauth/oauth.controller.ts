import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { IOAuthController } from "./interfaces/IOAuthController";
import { Request, Response } from "express";
import { HandleCallbackDto } from "./dto";
import { ApiQuery } from "src/utils/swagger-decorator";

@Controller("oauth")
export class OauthController implements IOAuthController {
  constructor(private oauthService: OAuthService) {}

  @Get("/")
  async initiateOAuth(@Query("provider") provider: string) {
    const url = await this.oauthService.initiateOAuth(provider);
    return { url };
  }

  @ApiQuery({ type: HandleCallbackDto })
  @Get("/callback")
  async handleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query() payload: HandleCallbackDto,
  ) {
    const result = await this.oauthService.handleCallback(req, res, payload);
    return res.status(201).json(result);
  }
}
