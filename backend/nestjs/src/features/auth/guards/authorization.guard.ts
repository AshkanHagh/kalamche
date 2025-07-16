import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { RepositoryService } from "src/repository/repository.service";
import { AuthUtilService } from "../util.service";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private repo: RepositoryService,
    private authUtilService: AuthUtilService,
    @AuthConfig() private config: IAuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const accessToken = token.split("Bearer ")[1];
    const payload = this.authUtilService.verifyToken(
      accessToken,
      this.config.accessToken.secret!,
    );
    const user = await this.repo.user().findById(payload.userId);
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    req.user = user;
    return true;
  }
}
