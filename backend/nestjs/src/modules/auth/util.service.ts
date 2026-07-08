import { randomInt } from "crypto";
import { AuthConfig, IAuthConfig } from "src/config/auth.config";
import { EmailService } from "../email/email.service";
import { CookieOptions, Request, Response } from "express";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Database } from "src/drizzle/types";
import {
  IUser,
  IUserInsertForm,
  PendingUserTable,
  UserLoginTokenTable,
  UserTable,
  WalletTable,
} from "src/drizzle/schemas";
import { JwtService } from "@nestjs/jwt";
import { EmailTemplate } from "../email/types";
import { eq } from "drizzle-orm";

export class AuthUtilService {
  constructor(
    @AuthConfig() private authConfig: IAuthConfig,
    private jwtService: JwtService,
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
    const verificationToken = await this.jwtService.signAsync(
      {
        userId,
        code: verificationCode,
      },
      {
        expiresIn: this.authConfig.verificationToken.exp,
        secret: this.authConfig.verificationToken.secret,
      },
    );

    await tx
      .update(PendingUserTable)
      .set({ token: verificationToken })
      .where(eq(PendingUserTable.id, userId));
    await this.emailService.sendMail({
      to: email,
      subject: "verify your account",
      template: EmailTemplate.VERIFY_EMAIL,
      context: {
        code: verificationCode,
      },
    });
    return verificationToken;
  }

  async refreshToken(tx: Database, req: Request, userId: string) {
    const accessToken = await this.jwtService.signAsync({
      userId,
    });
    const refreshToken = await this.jwtService.signAsync(
      { userId },
      {
        expiresIn: this.authConfig.refreshToken.exp,
        secret: this.authConfig.refreshToken.secret,
      },
    );

    const userAgent = req.headers["user-agent"];
    let userIp = req.headers["x-forwarded-for"] as string | undefined;
    if (userIp) {
      userIp = userIp.split(",")[0].trim();
    } else {
      userIp = req.connection.remoteAddress || req.socket.remoteAddress;
    }

    const form = {
      token: refreshToken,
      userId,
      userAgent,
      ip: userIp,
    };
    await tx
      .insert(UserLoginTokenTable)
      .values(form)
      .onConflictDoUpdate({
        target: UserLoginTokenTable.userId,
        set: {
          createdAt: new Date(),
          userAgent: form.userAgent,
          ip: form.ip,
          token: form.token,
        },
      });
    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyToken<T>(token: string, secret: string) {
    try {
      const result = await this.jwtService.verifyAsync<{ userId: string } & T>(
        token,
        {
          secret,
        },
      );
      return result;
    } catch (error: unknown) {
      throw new KalamcheError(KalamcheErrorType.InvalidJwtToken, error);
    }
  }

  // NOTE: NOT COMPLETED YET
  async findOrCreateUser(tx: Database, userForm: IUserInsertForm) {
    let user = await tx.query.UserTable.findFirst({
      where: eq(UserTable.email, userForm.email),
    });
    if (!user) {
      const [newUser] = await tx.insert(UserTable).values(userForm).returning();
      user = newUser;
      // initiate default user free trial wallet
      await tx.insert(WalletTable).values({
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
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
