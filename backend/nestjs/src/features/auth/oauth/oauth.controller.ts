import { Controller, Get, Query } from "@nestjs/common";
import { OAuthService } from "./oauth.service";
import { IOAuthController } from "./interfaces/IOAuthController";

@Controller("oauth")
export class OauthController implements IOAuthController {
  constructor(private oauthService: OAuthService) {}

  @Get("/")
  async initiateOAuth(@Query("provider") provider: string) {
    const url = await this.oauthService.initiateOAuth(provider);
    return { url };
  }
}
