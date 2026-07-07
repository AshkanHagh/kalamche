import { Inject, Injectable } from "@nestjs/common";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "./dto";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Database } from "src/drizzle/types";
import * as argon2 from "argon2";
import { AuthUtilService } from "./util.service";
import { RESEND_CODE_COOLDOWN } from "./constants";
import { getElapsedTime } from "src/utils/elapsed-time";
import { Request, Response } from "express";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import {
  PendingUserTable,
  UserLoginTokenTable,
  UserTable,
} from "src/drizzle/schemas";
import { DATABASE } from "src/drizzle/constants";
import { eq } from "drizzle-orm";
import { USER_ROLE } from "src/constants/global.constant";

@Injectable()
export class AuthService {
  constructor(
    private authUtil: AuthUtilService,
    @AuthConfig() private config: IAuthConfig,
    @Inject(DATABASE) private db: Database,
  ) {}

  async register(payload: RegisterDto) {
    const emailExists = await this.db.query.UserTable.findFirst({
      where: eq(UserTable.email, payload.email),
    });
    if (emailExists) {
      throw new KalamcheError(KalamcheErrorType.EmailAlreadyExists);
    }

    let pendingUser = await this.db.query.PendingUserTable.findFirst({
      where: eq(PendingUserTable.email, payload.email),
    });

    return await this.db.transaction(async (tx) => {
      if (pendingUser) {
        // check if previews register email otp is expired or not
        const minutesElapsed = getElapsedTime(pendingUser.createdAt, "minutes");
        if (minutesElapsed < RESEND_CODE_COOLDOWN) {
          throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
        }
      } else {
        const hashedPassword = await argon2.hash(payload.password);
        const [pUser] = await tx
          .insert(PendingUserTable)
          .values({
            email: payload.email,
            passwordHash: hashedPassword,
            // token will set later
            token: "",
          })
          .returning();
        pendingUser = pUser;
      }

      return await this.authUtil.initiateAccountVerification(
        tx,
        pendingUser.id,
        payload.email,
      );
    });
  }

  async resendVerificationCode(payload: ResendVerificationCodeDto) {
    const pendingUser = await this.db.query.PendingUserTable.findFirst({
      where: eq(PendingUserTable.email, payload.email),
    });
    if (!pendingUser) {
      throw new KalamcheError(KalamcheErrorType.NotRegistered);
    }

    const minutesElapsed = getElapsedTime(pendingUser.createdAt, "minutes");
    if (minutesElapsed < RESEND_CODE_COOLDOWN) {
      throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
    }

    return await this.db.transaction(async (tx) => {
      return await this.authUtil.initiateAccountVerification(
        tx,
        pendingUser.id,
        payload.email,
      );
    });
  }

  async login(res: Response, req: Request, payload: LoginDto) {
    const user = await this.db.query.UserTable.findFirst({
      where: eq(UserTable.email, payload.email),
    });
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
    }
    if (!user.passwordHash) {
      throw new KalamcheError(KalamcheErrorType.NoPasswordOAuthError);
    }
    if (!(await argon2.verify(user.passwordHash, payload.password))) {
      throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
    }

    return await this.db.transaction(async (tx) => {
      const response = await this.authUtil.generateLoginRes(tx, res, req, user);
      return {
        user: response.user,
        accessToken: response.tokens.accessToken,
        verificationEmailSent: false,
      };
    });
  }

  async verifyEmailRegistration(
    res: Response,
    req: Request,
    payload: VerifyEmailRegistrationDto,
  ) {
    const token = await this.authUtil.verifyToken<{ code: number }>(
      payload.token,
      this.config.verificationToken.secret!,
    );
    if (token.code !== payload.code) {
      throw new KalamcheError(KalamcheErrorType.InvalidVerifyCode);
    }

    return await this.db.transaction(async (tx) => {
      const [pendingUser] = await tx
        .delete(PendingUserTable)
        .where(eq(PendingUserTable.id, token.userId))
        .returning();

      if (!pendingUser || !pendingUser.passwordHash) {
        throw new KalamcheError(KalamcheErrorType.NotRegistered);
      }
      const elapsedTime = getElapsedTime(pendingUser?.createdAt, "minutes");
      if (elapsedTime > 1) {
        throw new KalamcheError(KalamcheErrorType.VerifyTokenExpired);
      }

      const username = pendingUser.email.split("@")[0];
      const user = await this.authUtil.findOrCreateUser(tx, {
        email: pendingUser.email,
        name: username,
        passwordHash: pendingUser.passwordHash,
        roles: [USER_ROLE.USER],
      });

      const response = await this.authUtil.generateLoginRes(tx, res, req, user);
      return {
        accessToken: response.tokens.accessToken,
        user: response.user,
      };
    });
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh_token"] as string | undefined;
    if (!refreshToken) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const result = await this.authUtil.verifyToken(
      refreshToken,
      this.config.refreshToken.secret!,
    );
    const user = await this.db.query.UserTable.findFirst({
      where: eq(UserTable.id, result.userId),
    });
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const loginToken = await this.db.query.UserLoginTokenTable.findFirst({
      where: eq(UserLoginTokenTable.userId, user.id),
    });
    if (loginToken!.token !== refreshToken) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    return await this.db.transaction(async (tx) => {
      const tokens = await this.authUtil.refreshToken(tx, req, user.id);
      this.authUtil.setCookies(res, tokens.accessToken, tokens.refreshToken);
      return {
        accessToken: tokens.accessToken,
      };
    });
  }
}
