import { Inject, Injectable } from "@nestjs/common";
import { createCacheKey } from "src/common/utils";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle/constants";
import { LoginTokenSchema } from "src/drizzle/schema";
import { Postgres } from "src/drizzle/types";

@Injectable()
export class TokenService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Postgres,
    private readonly config: ConfigService,
  ) {}

  public async createAuthToken(userId: string, permissions: string[]) {
    const accessToken = this.config.authOptions.token.signAccessToken(
      userId,
      permissions,
    );

    const refreshToken = this.config.authOptions.token.signRefreshToken(userId);
    await this.updateTokenHashAndLastLogin(userId, refreshToken);

    return {
      refreshToken,
      accessToken,
    };
  }

  private async updateTokenHashAndLastLogin(
    userId: string,
    refreshToken: string,
  ) {
    const refreshTokenHash =
      await this.config.authOptions.passwordStrategy.hash(refreshToken);

    const rfHashCacheKey = createCacheKey("user", "token_hash", userId);

    await Promise.all([
      await this.connection
        .insert(LoginTokenSchema)
        .values({
          userId,
          tokenHash: refreshTokenHash,
          published: new Date(),
        })
        .onConflictDoUpdate({
          target: LoginTokenSchema.userId,
          set: { tokenHash: refreshTokenHash, published: new Date() },
        }),

      await this.config.systemOpitons.cacheSterategy.set(
        rfHashCacheKey,
        refreshToken,
        this.config.authOptions.tokenOptions.tokenCacheDuration,
      ),
    ]);
  }
}
