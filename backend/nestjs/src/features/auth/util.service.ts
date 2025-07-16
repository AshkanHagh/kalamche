import { randomInt } from "crypto";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import * as jwt from "jsonwebtoken";
import { RepositoryService } from "src/repository/repository.service";
import { EmailService } from "../email/email.service";
import { CookieOptions, Request, Response } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IUser, IUserInsertForm } from "src/drizzle/types";

export class AuthUtilService {
  constructor(
    @AuthConfig() private authConfig: IAuthConfig,
    private repo: RepositoryService,
    private emailService: EmailService,
  ) {}

  // generate verification token, update pending user token,
  // send verification code to user email
  async initiateAccountVerification(
    userId: string,
    email: string,
  ): Promise<string> {
    const verificationCode = randomInt(100_000, 999_999);

    const tokenExp = Math.floor(
      (Date.now() / 1000) * this.authConfig.verificationToken.exp,
    );
    const verificationToken: string = jwt.sign(
      {
        exp: tokenExp,
        userId,
        code: verificationCode,
      },
      this.authConfig.verificationToken.secret!,
    );

    await this.repo.pendingUser().update(userId, { token: verificationToken });

    await this.emailService.sendVerificationAccountEmail({
      code: verificationCode,
      to: email,
    });
    return verificationToken;
  }

  async refreshToken(req: Request, userId: string) {
    const now = Math.floor(Date.now() / 1000);

    const accessToken = jwt.sign(
      {
        exp: now * this.authConfig.accessToken.exp,
        userId,
        type: "access",
      },
      this.authConfig.accessToken.secret!,
    );
    const refreshToken = jwt.sign(
      {
        exp: now * this.authConfig.refreshToken.exp,
        userId,
        type: "refresh",
      },
      this.authConfig.refreshToken.secret!,
    );

    const clientIp =
      process.env.NODE_ENV !== "production"
        ? req.connection.remoteAddress
        : req.ip;
    const userAgent = req.headers["user-agent"];

    await this.repo.userLoginToken().insertOrUpdate({
      token: refreshToken,
      userId,
      userAgent,
      ip: clientIp,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  verifyToken<T>(token: string, secret: string) {
    try {
      const result = jwt.verify(token, secret);
      return result as { userId: string; type: string } & T;
    } catch (error: unknown) {
      throw new KalamcheError(KalamcheErrorType.InvalidJwtToken, error);
    }
  }

  // NOT COMPLETED YET
  async findOrCreateUser(userForm: IUserInsertForm) {
    let user = await this.repo.user().findByEmail(userForm.email);
    if (!user) {
      user = await this.repo.user().insert(userForm);
    }

    return user;
  }

  setCookies(res: Response, accessToken: string, refreshToken: string) {
    const cookieOptions: CookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
    };

    res
      .cookie("access_token", accessToken, {
        ...cookieOptions,
        maxAge: 1000 * this.authConfig.accessToken.exp,
      })
      .cookie("refresh_token", refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * this.authConfig.refreshToken.exp,
      });
  }

  async generateLoginRes(res: Response, req: Request, user: IUser) {
    const userView = await this.repo.user().findUserView(user.id);
    const tokens = await this.refreshToken(req, user.id);

    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { tokens, userView };
  }
}
