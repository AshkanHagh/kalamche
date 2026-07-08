import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  Res,
} from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { Request, Response } from "express";
import { HandleCallbackDto } from "./dto";

@Controller("oauth")
export class OauthController {
  constructor(private oauthService: OAuthService) {}

  @Get("/")
  async initiateOAuth(@Query("provider") provider: string) {
    const url = await this.oauthService.initiateOAuth(provider);
    return {
      url,
    };
  }

  @Get("/callback")
  @HttpCode(HttpStatus.CREATED)
  async handleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query() payload: HandleCallbackDto,
  ) {
    return await this.oauthService.handleCallback(req, res, payload);
  }
}
