import { ForbiddenException, Inject } from "@nestjs/common";
import { createCacheKey } from "src/common/cache-name";
import { CatchError } from "src/common/error/catch-error";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
import {
  OAuthAccountSchema,
  User,
  UserRecord,
  UserSchema,
} from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";
import { TokenService } from "./token.service";
import { PermissionService } from "./permission.service";
import { OAuthUser } from "src/config/auth/oauth-clients";

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

  private async findUserByOAuthAccountOrCreate(userInfo: OAuthUser) {
    const account = await this.connection.query.OAuthAccountSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.oauthUserId, userInfo.id),
      with: {
        user: true,
      },
    });

    let user: User;

    if (!account) {
      const createdUser = (
        await this.connection
          .insert(UserSchema)
          .values({
            email: userInfo.email,
            name: userInfo.name,
            avatarUrl: userInfo.avatarUrl,
          })
          .returning()
      )[0];

      await Promise.all([
        await this.permissionService.createDefaultPermissionsForUser(
          createdUser.id,
        ),

        await this.connection.insert(OAuthAccountSchema).values({
          userId: createdUser.id,
          oauthUserId: userInfo.id,
        }),
      ]);

      user = createdUser;
    } else {
      user = account.user;
    }

    return user;
  }

  public async oauthRegister(userInfo: OAuthUser) {
    try {
      const user = await this.findUserByOAuthAccountOrCreate(userInfo);
      const userPermissions = await this.permissionService.getUserPermissions(
        user.id,
      );

      const token = await this.tokenService.createAutnetiationTokens(
        user.id,
        userPermissions,
      );

      const userRecord = this.intoRecord(user, userPermissions);
      await this.addUserToCache(userRecord);

      return {
        user: userRecord,
        ...token,
      };
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private async addUserToCache(user: UserRecord) {
    try {
      const userCacheKey = createCacheKey("user", user.id);
      const oneDay = 60 * 60 * 24;

      await this.config.systemOpitons.cacheSterategy.set(
        userCacheKey,
        user,
        oneDay,
      );
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async refreshToken(refreshToken: string) {
    try {
      const rtClaims = this.tokenService.decodeRefreshToken(refreshToken);
      const user = await this.getUserWithPermissions(rtClaims.sub);
      const loginToken = await this.connection.query.LoginTokenSchema.findFirst(
        {
          where: (table, funcs) => funcs.eq(table.userId, user.id),
        },
      );

      await this.tokenService.isRefreshTokenMatchesHash(
        loginToken!.tokenHash,
        refreshToken,
      );

      const tokens = await this.tokenService.createAutnetiationTokens(
        user.id,
        user.permissions,
      );

      return tokens;
    } catch (error: unknown) {
      throw CatchError(error);
    }
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
}
