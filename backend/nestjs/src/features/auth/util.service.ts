import { randomInt } from "crypto";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import * as jwt from "jsonwebtoken";
import { RepositoryService } from "src/repository/repository.service";
import { EmailService } from "../email/email.service";

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

    // TODO: send verification token
    await this.emailService.sendVerificationAccountEmail({
      code: verificationCode,
      to: email,
    });
    return verificationToken;
  }
}
