import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Request } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { Reflector } from "@nestjs/core";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { UserTable } from "src/drizzle/schemas";

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @AuthConfig() private config: IAuthConfig,
    @Inject(DATABASE) private db: Database,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.get<boolean>("skip-auth", context.getHandler())) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();

    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const accessToken = token.split("Bearer ")[1];
    let tokenPayload: { userId: string };
    try {
      tokenPayload = jwt.verify(
        accessToken,
        this.config.accessToken.secret!,
      ) as { userId: string };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.InvalidJwtToken, error);
    }

    const [user] = await this.db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, tokenPayload.userId));
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    req.user = user;
    return true;
  }
}
