import {
  BadRequestException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { createCacheKey } from "src/common/cache-name";
import { CatchError } from "src/common/error/catch-error";
import { OAuthUser } from "src/config/auth/oauth.strategy";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
import { User, UserRecord, UserSchema } from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";
import { TokenService } from "./token.service";
import { PermissionService } from "./permission.service";

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

  private async findOrCreateUser(userInfo: OAuthUser) {
    let user = await this.connection.query.UserSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.email, userInfo.email),
    });

    if (!user) {
      const createdUser = await this.connection
        .insert(UserSchema)
        .values({
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.imageUrl,
        })
        .returning();

      if (!createdUser[0]) {
        throw new BadRequestException("could not insert user");
      }

      user = createdUser[0];
      await this.permissionService.createDefaultPermissionsForUser(user.id);
    }

    return user;
  }

  public async oauthRegister(userInfo: OAuthUser) {
    try {
      const existingUser = await this.findOrCreateUser(userInfo);
      const userPermissions = await this.permissionService.getUserPermissions(
        existingUser.id,
      );

      const token = await this.tokenService.createAutnetiationTokens(
        existingUser.id,
        userPermissions,
      );

      const userRecord = this.intoRecord(existingUser, userPermissions);
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

      await this.tokenService.isRTMatchUserRT(
        user.refreshTokenHash || "",
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
