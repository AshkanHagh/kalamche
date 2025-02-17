import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import {
  OAuthPlatforms,
  OAuthStrategy,
  OauthUser,
} from "./services/oauth/oauth-strategy";
import { GithubOauthSterategy } from "./services/oauth/github-strategy";
import { ConfigService } from "@nestjs/config";
import {
  InsertUserDto,
  UserRepository,
} from "../user/repository/user.repository";
import { UserRecord } from "../user/types";
import * as argon2 from "argon2";
import { CatchError } from "src/common/utils/error";

@Injectable()
export class AuthService {
  private readonly providers: Map<OAuthPlatforms, OAuthStrategy> = new Map();

  constructor(
    private readonly config: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    this.providers.set(
      OAuthPlatforms.Github,
      new GithubOauthSterategy(this.config),
    );
  }

  private getOAuthProvider(oauthPlatform: OAuthPlatforms): OAuthStrategy {
    const provider = this.providers.get(oauthPlatform);
    if (!provider) {
      throw new BadRequestException("Oauth platform not found");
    }
    return provider;
  }

  public getOAuthUrl(oauthPlatform: OAuthPlatforms): string {
    const provider = this.getOAuthProvider(oauthPlatform);

    return provider.createOAuthUrl();
  }

  public async authenticateOAuthCallback(
    code: string,
    platform: OAuthPlatforms,
  ): Promise<OauthUser> {
    try {
      const provider = this.getOAuthProvider(platform);
      return await provider.authenticate(code);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async findUserByEmail(email: string): Promise<UserRecord | undefined> {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (user) {
        return this.userRepository.intoRecord(user);
      }
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async register(user: OauthUser): Promise<UserRecord> {
    try {
      const existingUser = await this.findUserByEmail(user.email);
      if (!existingUser) {
        const insertUserDto: InsertUserDto = {
          email: user.email,
          name: user.fullname,
          avatarUrl: user.avatar_url,
        };
        return await this.userRepository.insert(insertUserDto);
      }

      return existingUser;
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async updateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const refreshTokenHash = await argon2.hash(refreshToken);
      await this.userRepository.updateRefreshToken(userId, refreshTokenHash);
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async isRefreshTokenMatchHash(
    userId: string,
    token: string,
  ): Promise<void> {
    try {
      const userRefreshToken =
        await this.userRepository.findRefreshToken(userId);
      const isMatch = await argon2.verify(userRefreshToken, token);

      if (!isMatch) {
        throw new ForbiddenException();
      }
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  public async findUserById(userId: string): Promise<UserRecord> {
    return await this.userRepository.findUserById(userId);
  }
}
