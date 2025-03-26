import { Inject, Injectable } from "@nestjs/common";
import { signAccessToken, signRefreshToken } from "src/config/auth/token";
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

  public createAuthToken(userId: string, permissions: string[]) {
    const accessToken = signAccessToken(
      this.config.authOptions.accessTokenConfig,
      userId,
      permissions,
    );
    const refreshToken = signRefreshToken(
      this.config.authOptions.refreshTokenConfig,
      userId,
    );

    return {
      refreshToken,
      accessToken,
    };
  }

  public async updateLoginToken(userId: string, refreshToken: string) {
    const refreshTokenHash =
      await this.config.authOptions.passwordHashingStrategy.hash(refreshToken);

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
      });
  }
}
