import { randomInt } from "crypto";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import * as jwt from "jsonwebtoken";
import { EmailService } from "../email/email.service";
import { CookieOptions, Request, Response } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Database } from "src/drizzle/types";
import { UserRepository } from "src/repository/repositories/user.repository";
import { PendingUserRepository } from "src/repository/repositories/pending-user.repository";
import { UserLoginTokenRepository } from "src/repository/repositories/user-login-token.repository";
import { WalletRepository } from "src/repository/repositories/wallet.repository";
import { IUser, IUserInsertForm } from "src/drizzle/schemas";

export class AuthUtilService {
  constructor(
    @AuthConfig() private authConfig: IAuthConfig,
    private userRepository: UserRepository,
    private pendingUserRepository: PendingUserRepository,
    private userLoginTokenRepository: UserLoginTokenRepository,
    private walletRepository: WalletRepository,
    private emailService: EmailService,
  ) {}

  // generate verification token, update pending user token,
  // send verification code to user email
  async initiateAccountVerification(
    tx: Database,
    userId: string,
    email: string,
  ): Promise<string> {
    const verificationCode = randomInt(100_000, 999_999);

    const verificationToken: string = jwt.sign(
      {
        exp: Math.floor(
          (Date.now() / 1000) * this.authConfig.verificationToken.exp,
        ),
        userId,
        code: verificationCode,
      },
      this.authConfig.verificationToken.secret!,
    );

    await this.pendingUserRepository.update(tx, userId, {
      token: verificationToken,
    });

    await this.emailService.sendVerificationAccountEmail({
      code: verificationCode,
      to: email,
    });
    return verificationToken;
  }

  async refreshToken(tx: Database, req: Request, userId: string) {
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

    let userIp = req.headers["x-forwarded-for"] as string | undefined;
    if (userIp) {
      userIp = userIp.split(",")[0].trim();
    } else {
      userIp = req.connection.remoteAddress || req.socket.remoteAddress;
    }
    const userAgent = req.headers["user-agent"];

    await this.userLoginTokenRepository.insertOrUpdate(tx, {
      token: refreshToken,
      userId,
      userAgent,
      ip: userIp,
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
  async findOrCreateUser(tx: Database, userForm: IUserInsertForm) {
    let user = await this.userRepository.findByEmail(tx, userForm.email);
    if (!user) {
      user = await this.userRepository.insert(tx, userForm);
      // initiate default user free trial wallet
      await this.walletRepository.insert(tx, {
        tokens: 50,
        userId: user.id,
      });
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

  async generateLoginRes(
    tx: Database,
    res: Response,
    req: Request,
    user: IUser,
  ) {
    const { passwordHash, updatedAt, ...result } = user;
    const tokens = await this.refreshToken(tx, req, user.id);

    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { tokens, user: result };
  }
}
