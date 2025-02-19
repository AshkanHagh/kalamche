import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { NextFunction, Response } from "express";
import { CatchError } from "src/common/utils/error";
import { AuthService } from "src/core/auth/auth.service";
import { TokenService } from "src/core/auth/services/token/jwt";
import { CustomeRequest } from "../types/req";

@Injectable()
export class AuthorizationMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userService: AuthService,
  ) {}

  async use(req: CustomeRequest, res: Response, next: NextFunction) {
    try {
      const accessToken = req.headers.authorization;
      if (!accessToken) {
        throw new UnauthorizedException();
      }

      if (!accessToken.includes("Bearer ")) {
        throw new HttpException("Invalid bearer token", HttpStatus.BAD_REQUEST);
      }

      const userId = this.tokenService.decodeAccessToken(
        accessToken.split("Bearer ")[1],
      );
      const user = await this.userService.findUserById(userId);

      req.userId = user.id;
      next();
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
