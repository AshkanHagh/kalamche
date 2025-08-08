import { Inject, Injectable } from "@nestjs/common";
import { IAuthService } from "./interfaces/IService";
import {
  LoginDto,
  RegisterDto,
  ResendVerificationCodeDto,
  VerifyEmailRegistrationDto,
} from "./dto";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Database, IPendingUser } from "src/drizzle/types";
import * as argon2 from "argon2";
import { AuthUtilService } from "./util.service";
import {
  LoginPendingResponse,
  LoginResponse,
  VerifyEmailRegistrationRes,
} from "./types";
import { RESEND_CODE_COOLDOWN } from "./constants";
import { getElapsedTime } from "src/utils/elapsed-time";
import { Request, Response } from "express";
import { USER_ROLE } from "src/constants/global.constant";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { UserRepository } from "src/repository/repositories/user.repository";
import { PendingUserRepository } from "src/repository/repositories/pending-user.repository";
import { UserLoginTokenRepository } from "src/repository/repositories/user-login-token.repository";
import { DATABASE } from "src/drizzle/constants";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private userRepository: UserRepository,
    private pendingUserRepository: PendingUserRepository,
    private userLoginTokenRepository: UserLoginTokenRepository,
    private authUtil: AuthUtilService,
    @AuthConfig() private config: IAuthConfig,
    @Inject(DATABASE) private db: Database,
  ) {}

  async register(payload: RegisterDto): Promise<string> {
    const emailExists = await this.userRepository.emailExists(payload.email);
    if (emailExists) {
      throw new KalamcheError(KalamcheErrorType.EmailAlreadyExists);
    }

    let pendingUser: IPendingUser | undefined;
    pendingUser = await this.pendingUserRepository.findByEmail(payload.email);

    return await this.db.transaction(async (tx) => {
      if (pendingUser) {
        const minutesElapsed = getElapsedTime(pendingUser.createdAt, "minutes");
        if (minutesElapsed < RESEND_CODE_COOLDOWN) {
          throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
        }
      } else {
        const hashedPassword = await argon2.hash(payload.password);
        pendingUser = await this.pendingUserRepository.insert(tx, {
          email: payload.email,
          passwordHash: hashedPassword,
          token: "",
        });
      }

      return await this.authUtil.initiateAccountVerification(
        tx,
        pendingUser.id,
        payload.email,
      );
    });
  }

  async resendVerificationCode(
    payload: ResendVerificationCodeDto,
  ): Promise<string> {
    const pendingUser = await this.pendingUserRepository.findByEmail(
      payload.email,
    );
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

  // Login has two scenarios:
  // 1. If the user's last interaction with the app was more than 12 hours ago, they must log in using 2FA.
  // 2. If it was within 12 hours, a normal login is allowed.
  async login(
    res: Response,
    req: Request,
    payload: LoginDto,
  ): Promise<LoginPendingResponse | LoginResponse> {
    const user = await this.userRepository.findByEmail(this.db, payload.email);
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
    }

    if (!user.passwordHash) {
      throw new KalamcheError(KalamcheErrorType.NoPasswordOAuthError);
    }

    if (!(await argon2.verify(user.passwordHash, payload.password))) {
      throw new KalamcheError(KalamcheErrorType.InvalidEmailAddress);
    }

    const loginToken = await this.userLoginTokenRepository.findByUserId(
      user.id,
    );

    return await this.db.transaction(async (tx) => {
      const hoursElapsed = getElapsedTime(loginToken.createdAt, "hours");
      // Check if 12+ hours have passed since token creation. If so,
      // create a pending user for verification.
      if (hoursElapsed >= 12) {
        // Remove existing pending user to allow resending a new code
        const pendingUser = await this.pendingUserRepository.deleteByEmail(
          tx,
          payload.email,
        );

        if (pendingUser) {
          const minutesElapsed = getElapsedTime(
            pendingUser.createdAt,
            "minutes",
          );

          // Block if not enough time has passed
          if (minutesElapsed < RESEND_CODE_COOLDOWN) {
            throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
          }
        }

        const hashedPass = await argon2.hash(payload.password);
        const newPendingUser = await this.pendingUserRepository.insert(tx, {
          email: payload.email,
          passwordHash: hashedPass,
          token: "",
        });

        const verificationToken =
          await this.authUtil.initiateAccountVerification(
            tx,
            newPendingUser.id,
            newPendingUser?.email,
          );

        return {
          token: verificationToken,
          verificationEmailSent: true,
        };
      }

      // If less than 12 hours have passed, log the user in and generate access tokens.
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
  ): Promise<VerifyEmailRegistrationRes> {
    const token = this.authUtil.verifyToken<{ code: number }>(
      payload.token,
      this.config.verificationToken.secret!,
    );
    if (token.code !== payload.code) {
      throw new KalamcheError(KalamcheErrorType.InvalidVerifyCode);
    }

    return await this.db.transaction(async (tx) => {
      const pendingUser = await this.pendingUserRepository.delete(
        tx,
        token.userId,
      );

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

  async refreshToken(
    req: Request,
    res: Response,
  ): Promise<{ accessToken: string }> {
    const refreshToken = req.cookies["refresh_token"] as string | undefined;
    if (!refreshToken) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const result = this.authUtil.verifyToken(
      refreshToken,
      this.config.refreshToken.secret!,
    );
    const user = await this.userRepository.findById(this.db, result.userId);
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.UnAuthorized);
    }

    const loginToken = await this.userLoginTokenRepository.findByUserId(
      user.id,
    );
    if (loginToken.token !== refreshToken) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    return await this.db.transaction(async (tx) => {
      const tokens = await this.authUtil.refreshToken(tx, req, user.id);
      this.authUtil.setCookies(res, tokens.accessToken, tokens.refreshToken);
      return { accessToken: tokens.accessToken };
    });
  }
}
