import { Inject } from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle/constants";
import {
  InsertUser,
  LoginTokenSchema,
  OAuthAccountSchema,
  PendingUserSchema,
  User,
  UserRecord,
  UserSchema,
} from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";
import { TokenService } from "./token.service";
import { PermissionService } from "./permission.service";
import { OAuthUser } from "src/config/auth/oauth/oauth-clients";
import {
  RegisterDto,
  VerifyEmailRegistratonDto,
} from "src/api/common/auth-generated-types";
import { v4 as uuid } from "uuid";
import { generateOTP } from "src/common/utils";
import { eq } from "drizzle-orm";
import {
  RefreshTokenClaims,
  signVerificationToken,
  VerificationTokenClaims,
  verifyToken,
} from "src/config/auth/token";
import {
  KalamcheError,
  KalamcheErrorType,
} from "src/common/error/error.exception";

export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Postgres,
    private readonly config: ConfigService,
    private readonly tokenService: TokenService,
    private readonly permissionService: PermissionService,
  ) {}

  public intoRecord(model: User, permissions: string[]): UserRecord {
    return {
      id: model.id,
      name: model.name,
      email: model.email,
      permissions,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt,
    };
  }

  public async authenticateWithOAuth(oauthUser: OAuthUser) {
    const [oauthAccount] = await this.connection
      .select()
      .from(OAuthAccountSchema)
      .where(eq(OAuthAccountSchema.oauthUserId, oauthUser.id));

    let user: User;

    if (oauthAccount) {
      const [existingUser] = await this.connection
        .select()
        .from(UserSchema)
        .where(eq(UserSchema.id, oauthAccount.userId));

      if (!existingUser) {
        throw new KalamcheError(KalamcheErrorType.InvalidOAuthAuthorization);
      }

      user = existingUser;
    } else {
      user = await this.createUserWithDefaultPermission({
        name: oauthUser.name,
        email: oauthUser.email,
        avatarUrl: oauthUser.avatarUrl,
      });

      await this.connection.insert(OAuthAccountSchema).values({
        userId: user.id,
        oauthUserId: oauthUser.id,
      });
    }

    return this.loginTokens(user);
  }

  public async refreshToken(refreshToken: string) {
    const refreshTokenClaims = verifyToken<RefreshTokenClaims>(
      this.config.authOptions.refreshTokenConfig,
      "REFRESH",
      refreshToken,
    );
    const user = await this.getUserWithPermissions(refreshTokenClaims.sub);

    const loginToken = await this.connection.query.LoginTokenSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.userId, user.id),
    });
    if (!loginToken) {
      throw new KalamcheError(KalamcheErrorType.NotLoggedIn);
    }

    const tokenMatches =
      await this.config.authOptions.passwordHashingStrategy.check(
        refreshToken,
        loginToken.tokenHash,
      );
    if (!tokenMatches) {
      throw new KalamcheError(KalamcheErrorType.NotLoggedIn);
    }

    const tokens = this.tokenService.createAuthToken(user.id, user.permissions);
    await this.tokenService.updateLoginToken(user.id, tokens.refreshToken);

    return tokens;
  }

  public async register(payload: RegisterDto) {
    const emailExists = await this.connection.query.UserSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.email, payload.email),
    });
    if (emailExists) {
      throw new KalamcheError(KalamcheErrorType.EmailAlreadyExists);
    }

    const [pendingUser] = await this.connection
      .select()
      .from(PendingUserSchema)
      .where(eq(PendingUserSchema.email, payload.email));
    if (pendingUser) {
      throw new KalamcheError(KalamcheErrorType.AccountVerificationIsPending);
    }

    const { token, code } = await this.createPendingUser(payload);
    await this.sendVerificationEmail(payload.email, code);

    return token;
  }

  public async verifyEmailRegistration(payload: VerifyEmailRegistratonDto) {
    const tokenClaims = verifyToken<VerificationTokenClaims>(
      this.config.authOptions.verificationTokenConfig,
      "VERIFY",
      payload.token,
    );

    if (tokenClaims.code != payload.code) {
      throw new KalamcheError(KalamcheErrorType.InvalidVerificationCode);
    }

    const [pendingUser] = await this.connection
      .select()
      .from(PendingUserSchema)
      .where(eq(PendingUserSchema.id, tokenClaims.sub));
    if (!pendingUser) {
      throw new KalamcheError(KalamcheErrorType.AccountNotRegistered);
    }

    // Calculate the age of the verification token by subtracting the token's published time from the current time
    const tokenAge = Date.now() - new Date(pendingUser.published!).getTime();

    // Check if the verification token has expired
    if (tokenAge > this.config.authOptions.verificationTokenConfig.expireAt) {
      throw new KalamcheError(KalamcheErrorType.ExpiredVerificationCode);
    }

    let [user] = await this.connection
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, pendingUser.email));

    if (!user) {
      user = await this.createUserWithDefaultPermission({
        name: pendingUser.email.split("@")[0],
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
      });
    }

    await this.connection
      .delete(PendingUserSchema)
      .where(eq(PendingUserSchema.id, pendingUser.id));

    return this.loginTokens(user);
  }

  public async login(payload: RegisterDto) {
    const [user] = await this.connection
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, payload.email));
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.AccountNotRegistered);
    }
    if (!user.passwordHash) {
      throw new KalamcheError(KalamcheErrorType.AccountUsesOAuth);
    }

    const isPasswordMathes =
      await this.config.authOptions.passwordHashingStrategy.check(
        payload.password,
        user.passwordHash,
      );
    if (!isPasswordMathes) {
      throw new KalamcheError(KalamcheErrorType.InvalidPassword);
    }

    const [loginToken] = await this.connection
      .select()
      .from(LoginTokenSchema)
      .where(eq(LoginTokenSchema.userId, user.id));

    // Calculate the age of the login token by subtracting the token's published time from the current time
    const tokenAge = Date.now() - new Date(loginToken.published).getTime();

    // Check if the login token has been active for more than 12 hours (in milliseconds)
    if (tokenAge >= 1000 * 60 * 60 * 12) {
      const [pendingUser] = await this.connection
        .select()
        .from(PendingUserSchema)
        .where(eq(PendingUserSchema.email, payload.email));

      if (pendingUser) {
        throw new KalamcheError(KalamcheErrorType.AccountVerificationIsPending);
      }

      const { token, code } = await this.createPendingUser(payload);
      await this.sendVerificationEmail(user.email, code);

      return token;
    }

    return this.loginTokens(user);
  }

  public async sendVerificationEmail(email: string, code: string) {
    await this.config.emailOptions.sendVerificationEmail({
      email,
      redirectUrl: this.config.authOptions.verificationRedirectUrl,
      code,
    });
  }

  private async getUserWithPermissions(userId: string) {
    const user = await this.connection.query.UserSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, userId),
    });
    if (!user) {
      throw new KalamcheError(KalamcheErrorType.InvalidCredentials); // TODO: fix error type later
    }

    const userPermissions =
      await this.permissionService.getUserPermissions(userId);

    return { ...user, permissions: userPermissions };
  }

  private async createUserWithDefaultPermission(insertForm: InsertUser) {
    const [user] = await this.connection
      .insert(UserSchema)
      .values(insertForm)
      .returning();

    await this.permissionService.createDefaultPermissionsForUser(user.id);
    return user;
  }

  private async createPendingUser(payload: RegisterDto) {
    const pendingUserId = uuid();
    const verificationCode = generateOTP();
    const verificationToken = signVerificationToken(
      this.config.authOptions.verificationTokenConfig,
      pendingUserId,
      verificationCode,
    );

    await this.connection.insert(PendingUserSchema).values({
      email: payload.email,
      passwordHash: await this.config.authOptions.passwordHashingStrategy.hash(
        payload.password,
      ),
      token: verificationToken,
      id: pendingUserId,
    });

    return { token: verificationToken, code: verificationCode };
  }

  private async loginTokens(user: User) {
    const permissions = await this.permissionService.getUserPermissions(
      user.id,
    );
    const { refreshToken, accessToken } = this.tokenService.createAuthToken(
      user.id,
      permissions,
    );
    await this.tokenService.updateLoginToken(user.id, refreshToken);

    return {
      user: this.intoRecord(user, permissions),
      accessToken,
      refreshToken,
    };
  }
}
