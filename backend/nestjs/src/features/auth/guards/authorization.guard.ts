import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { AuthUtilService } from "../util.service";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { UserRepository } from "src/repository/repositories/user.repository";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private userRepository: UserRepository,
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
    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    req.user = user;
    return true;
  }
}
