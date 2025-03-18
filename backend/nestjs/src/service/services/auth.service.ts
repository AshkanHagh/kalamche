import {
  BadRequestException,
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle/constants";
import {
  InsertUser,
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
import { generateOTP, createCacheKey } from "src/common/utils";
import {
  AccountPendingToVerifyException,
  EmailAlreadyExistsException,
} from "src/common/error/error.exception";
import { eq } from "drizzle-orm";

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
    const oauthAccount =
      await this.connection.query.OAuthAccountSchema.findFirst({
        where: (table, funcs) => funcs.eq(table.oauthUserId, oauthUser.id),
      });

    let user: User;
    if (oauthAccount) {
      const [existingUser] = await this.connection
        .select()
        .from(UserSchema)
        .where(eq(UserSchema.id, oauthAccount.userId));

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

    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
    );
    const { refreshToken, accessToken } =
      await this.tokenService.createAuthToken(user.id, userPermissions);

    const userRecord = this.intoRecord(user, userPermissions);
    await this.addUserToCache(userRecord);

    return {
      user: userRecord,
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(refreshToken: string) {
    const claims =
      this.config.authOptions.token.verifyRefreshToken(refreshToken);
    const user = await this.getUserWithPermissions(claims.sub);

    const loginToken = await this.connection.query.LoginTokenSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.userId, user.id),
    });
    if (!loginToken) {
      throw new UnauthorizedException();
    }

    const tokenMatches = await this.config.authOptions.passwordStrategy.check(
      refreshToken,
      loginToken.tokenHash,
    );
    if (!tokenMatches) {
      throw new UnauthorizedException();
    }

    const tokens = await this.tokenService.createAuthToken(
      user.id,
      user.permissions,
    );

    return tokens;
  }

  public async register(payload: RegisterDto) {
    const emailExists = await this.connection.query.UserSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.email, payload.email),
    });
    if (emailExists) {
      throw new EmailAlreadyExistsException();
    }

    const pendingUser = await this.connection.query.PendingUserSchema.findFirst(
      {
        where: (table, funcs) => funcs.eq(table.email, payload.email),
      },
    );
    if (pendingUser) {
      throw new AccountPendingToVerifyException();
    }

    const pendingUserId = uuid();
    const verificationCode = generateOTP();
    const verificationToken =
      this.config.authOptions.token.signVerificationToken(
        pendingUserId,
        verificationCode,
      );

    await this.connection.insert(PendingUserSchema).values({
      email: payload.email,
      passwordHash: await this.config.authOptions.passwordStrategy.hash(
        payload.password,
      ),
      token: verificationToken,
      id: pendingUserId,
    });

    await this.config.emailOptions.sendVerificationEmail({
      email: payload.email,
      redirectUrl: this.config.authOptions.verificationRedirectUrl,
      code: verificationCode,
    });

    return verificationToken;
  }

  public async verifyEmailRegistration(payload: VerifyEmailRegistratonDto) {
    const tokenClaims = this.config.authOptions.token.verifyVerificationToken(
      payload.token,
    );

    if (tokenClaims.code != payload.code) {
      throw new BadRequestException("Invalid verification code.");
    }

    const [pendingUser] = await this.connection
      .select()
      .from(PendingUserSchema)
      .where(eq(PendingUserSchema.id, tokenClaims.sub));

    if (!pendingUser) {
      throw new BadRequestException("No pending verification.");
    }

    const tokenAge = Date.now() - new Date(pendingUser.published!).getTime();
    if (tokenAge > this.config.authOptions.tokenOptions.verificationExpiry) {
      throw new BadRequestException("Verification token expired.");
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

    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
    );
    const { refreshToken, accessToken } =
      await this.tokenService.createAuthToken(user.id, userPermissions);

    const userRecord = this.intoRecord(user, userPermissions);
    await this.addUserToCache(userRecord);

    return {
      user: userRecord,
      refreshToken,
      accessToken,
    };
  }

  private async addUserToCache(user: UserRecord) {
    const userCacheKey = createCacheKey("user", user.id);
    const oneDay = 60 * 60 * 24;

    await this.config.systemOpitons.cacheSterategy.set(
      userCacheKey,
      user,
      oneDay,
    );
  }

  private async getUserWithPermissions(userId: string) {
    const user = await this.connection.query.UserSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, userId),
    });
    if (!user) {
      throw new ForbiddenException();
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
}
