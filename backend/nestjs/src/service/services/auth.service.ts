import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  UnauthorizedException,
} from "@nestjs/common";
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
import { generateOTP, createCacheKey } from "src/common/utils";
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
      throw new ConflictException("email already exists");
    }

    const pendingUser = await this.connection.query.PendingUserSchema.findFirst(
      {
        where: (table, funcs) => funcs.eq(table.email, payload.email),
      },
    );
    if (pendingUser) {
      throw new ConflictException("account already is pending to verify");
    }

    const { token, code } = await this.createPendingUser(payload);
    await this.sendVerificationEmail(payload.email, code);

    return token;
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

  public async login(payload: RegisterDto) {
    const [user] = await this.connection
      .select()
      .from(UserSchema)
      .where(eq(UserSchema.email, payload.email));
    if (!user) {
      throw new BadRequestException("invalid email or password");
    }
    if (!user.passwordHash) {
      throw new BadRequestException("cannot login wiht oauth account");
    }

    const isPasswordMathes =
      await this.config.authOptions.passwordStrategy.check(
        payload.password,
        user.passwordHash,
      );
    if (!isPasswordMathes) {
      throw new BadRequestException("invalid email or password");
    }

    const [loginToken] = await this.connection
      .select()
      .from(LoginTokenSchema)
      .where(eq(LoginTokenSchema.userId, user.id));

    const tokenAge = Date.now() - new Date(loginToken.published).getTime();
    if (tokenAge >= 1000 * 60 * 60 * 12) {
      const [pendingUser] = await this.connection
        .select()
        .from(PendingUserSchema)
        .where(eq(PendingUserSchema.email, payload.email));
      if (pendingUser) {
        throw new ConflictException("account already is pending to verify");
      }

      const { token, code } = await this.createPendingUser(payload);
      await this.sendVerificationEmail(user.email, code);

      return token;
    }

    const permissions = await this.permissionService.getUserPermissions(
      user.id,
    );
    const { accessToken, refreshToken } =
      await this.tokenService.createAuthToken(user.id, permissions);

    const userRecord = this.intoRecord(user, permissions);
    await this.addUserToCache(userRecord);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  public async sendVerificationEmail(email: string, code: string) {
    await this.config.emailOptions.sendVerificationEmail({
      email,
      redirectUrl: this.config.authOptions.verificationRedirectUrl,
      code,
    });
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

  private async createPendingUser(payload: RegisterDto) {
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

    return { token: verificationToken, code: verificationCode };
  }
}
