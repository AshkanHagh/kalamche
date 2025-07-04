import { randomInt } from "crypto";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import * as jwt from "jsonwebtoken";
import { RepositoryService } from "src/repository/repository.service";
import { EmailService } from "../email/email.service";
import { Request } from "express";

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
    const verificationCode = randomInt(999_999);

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
    const accessToken = jwt.sign(
      {
        exp: (Date.now() / 1000) * this.authConfig.accessToken.exp,
        userId,
        type: "access",
      },
      this.authConfig.accessToken.secret!,
    );
    const refreshToken = jwt.sign(
      {
        exp: (Date.now() / 1000) * this.authConfig.refreshToken.exp,
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
}
