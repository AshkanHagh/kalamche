import { ForbiddenException, Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { createCacheKey } from "src/common/cache-name";
import { CatchError } from "src/common/error/catch-error";
import { RefreshTokenClaims } from "src/config/auth/token.strategy";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
import { UserSchema } from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";

@Injectable()
export class TokenService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Postgres,
    private readonly config: ConfigService,
  ) {}

  public async createAutnetiationTokens(userId: string, permissions: string[]) {
    try {
      const accessToken = this.config.authOptions.tokenStrategy.signAccessToken(
        {
          sub: userId,
          permissions,
        },
      );
      const refreshToken =
        this.config.authOptions.tokenStrategy.signRefreshToken({
          sub: userId,
        });

      await this.updateTokenHashAndLastLogin(userId, refreshToken);

      return {
        refreshToken,
        accessToken,
      };
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  private async updateTokenHashAndLastLogin(
    userId: string,
    refreshToken: string,
  ) {
    try {
      const refreshTokenHash =
        await this.config.authOptions.passwordStrategy.hash(refreshToken);

      const rfHashCacheKey = createCacheKey("user", "token_hash", userId);

      await Promise.all([
        await this.connection
          .update(UserSchema)
          .set({ refreshTokenHash, lastLogin: new Date() })
          .where(eq(UserSchema.id, userId)),

        await this.config.systemOpitons.cacheSterategy.set(
          rfHashCacheKey,
          refreshToken,
          this.config.authOptions.tokenCacheDuration,
        ),
      ]);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public decodeRefreshToken(refreshToken: string): RefreshTokenClaims {
    try {
      const claims =
        this.config.authOptions.tokenStrategy.verifyRefreshToken(refreshToken);

      return claims;
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async isRTMatchUserRT(userRt: string, rt: string): Promise<void> {
    const tokenMatches = await this.config.authOptions.passwordStrategy.check(
      rt,
      userRt || "",
    );
    if (!tokenMatches) {
      throw new ForbiddenException();
    }
  }
}
