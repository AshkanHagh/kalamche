import { Controller, Get } from "@nestjs/common";
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
}
