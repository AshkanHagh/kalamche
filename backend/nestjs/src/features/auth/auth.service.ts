import { Injectable } from "@nestjs/common";
import { IAuthService } from "./interfaces/service";
import { RegisterDto, ResendVerificationCodeDto } from "./dto";
import { RepositoryService } from "src/repository/repository.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IPendingUser } from "src/drizzle/types";
import * as argon2 from "argon2";
import { AuthUtilService } from "./util.service";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private repo: RepositoryService,
    private authUtil: AuthUtilService,
  ) {}

  async register(payload: RegisterDto): Promise<string> {
    const emailExists = await this.repo.user().emailExists(payload.email);
    if (emailExists) {
      throw new KalamcheError(KalamcheErrorType.EmailAlreadyExists);
    }

    let pendingUser: IPendingUser | undefined;
    pendingUser = await this.repo.pendingUser().findByEmail(payload.email);

    if (pendingUser) {
      const minutesElapsed =
        (Date.now() - pendingUser.createdAt.getTime()) / (1000 * 60);

      if (minutesElapsed < 1) {
        throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
      }

      await this.repo.pendingUser().update(pendingUser.id);
    } else {
      const hashedPassword = await argon2.hash(payload.password);
      pendingUser = await this.repo.pendingUser().insert({
        email: payload.email,
        passwordHash: hashedPassword,
        token: "",
      });
    }

    return await this.authUtil.initiateAccountVerification(
      pendingUser.id,
      payload.email,
    );
  }

  async resendVerificationCode(
    payload: ResendVerificationCodeDto,
  ): Promise<string> {
    const pendingUser = await this.repo
      .pendingUser()
      .findByEmail(payload.email);
    if (!pendingUser) {
      throw new KalamcheError(KalamcheErrorType.NotRegistered);
    }

    const minutesElapsed =
      (Date.now() - pendingUser.createdAt.getTime()) / (1000 * 60);
    if (minutesElapsed < 1) {
      throw new KalamcheError(KalamcheErrorType.RegistrationCooldown);
    }

    return await this.authUtil.initiateAccountVerification(
      pendingUser.id,
      pendingUser.email,
    );
  }
}
