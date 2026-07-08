import { Global, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { AuthUtilService } from "./util.service";
import { EmailModule } from "../email/email.module";
import { OauthController } from "./oauth/oauth.controller";
import { OAuthService } from "./oauth/oauth.service";
import { GithubOAuthService } from "./oauth/util-services/github-oauth.service";
import { DiscordOAuthService } from "./oauth/util-services/discrod-oauth.service";
import { RateLimitModule } from "../rate-limit/rate-limit.module";
import { APP_GUARD } from "@nestjs/core";
import { RateLimitGuard } from "../rate-limit/guards/rate-limit.guard";
import { AuthorizationGuard } from "./guards/authorization.guard";
import { PermissionGuard } from "./guards/permission.guard";
import { JwtModule } from "@nestjs/jwt";
import { authConfig, IAuthConfig } from "src/config/auth.config";

@Global()
@Module({
  imports: [
    EmailModule,
    JwtModule.registerAsync({
      global: true,
      inject: [authConfig.KEY],
      useFactory: (authConfig: IAuthConfig) => ({
        secret: process.env.ACCESS_TOKEN_SECRET,
        signOptions: {
          expiresIn: authConfig.accessToken.exp,
        },
      }),
    }),
    RateLimitModule.forFeature({
      keyExtractor: "ip",
      mode: "DRY_MODE",
      bucketSize: 5,
      refillRate: 1000 * 60 * 5,
    }),
  ],
  providers: [
    AuthService,
    AuthUtilService,
    PermissionGuard,
    AuthorizationGuard,
    OAuthService,
    GithubOAuthService,
    DiscordOAuthService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  controllers: [AuthController, OauthController],
  exports: [AuthorizationGuard, PermissionGuard],
})
export class AuthModule {}
