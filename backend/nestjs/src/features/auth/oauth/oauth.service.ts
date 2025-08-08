import { Inject, Injectable } from "@nestjs/common";
import { IOAuthService } from "./interfaces/IOAuthService";
import { GithubOAuthService } from "./util-services/github-oauth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { OAuthStateRepository } from "src/repository/repositories/oauth-state.repository";
import { Request, Response } from "express";
import { getElapsedTime } from "src/utils/elapsed-time";
import { DATABASE } from "src/drizzle/constants";
import { Database, IUser } from "src/drizzle/types";
import { OAuthAccountRepository } from "src/repository/repositories/oauth-account.repository";
import { UserRepository } from "src/repository/repositories/user.repository";
import { AuthUtilService } from "../util.service";
import { USER_ROLE } from "src/constants/global.constant";
import { DiscordOAuthService } from "./util-services/discrod-oauth.service";
import { HandleCallbackPayload } from "./dto";

@Injectable()
export class OAuthService implements IOAuthService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private githubOAuthService: GithubOAuthService,
    private discordOAuthService: DiscordOAuthService,
    private oauthStateRepository: OAuthStateRepository,
    private oauthAccountRepository: OAuthAccountRepository,
    private userRepository: UserRepository,
    private authUtilService: AuthUtilService,
  ) {}

  async initiateOAuth(providerName: string) {
    const provider = this.getProvider(providerName);
    const state = provider.generateState();

    return await this.db.transaction(async (tx) => {
      await this.oauthStateRepository.insert(tx, {
        provider: providerName,
        state,
      });

      return provider.generateAuthUrl(state);
    });
  }

  async handleCallback(
    req: Request,
    res: Response,
    payload: HandleCallbackPayload,
  ) {
    const provider = this.getProvider(payload.provider);

    const accountState = await this.oauthStateRepository.findByState(
      payload.provider,
      payload.state,
    );
    if (getElapsedTime(accountState.createdAt, "minutes") > 10) {
      await this.oauthStateRepository.delete(this.db, accountState.id);
      throw new KalamcheError(KalamcheErrorType.StateExpired);
    }

    return await this.db.transaction(async (tx) => {
      await this.oauthStateRepository.delete(tx, accountState.id);

      if (!provider.validateState(payload.state, accountState.state)) {
        throw new KalamcheError(KalamcheErrorType.InvalidOAuthState);
      }

      const result = await provider.exchangeCodeForTokens(payload.code);
      const oauthUser = await provider.getUserInfo(result.accessToken);

      const userOAuthAccount = await this.oauthAccountRepository.findByProvider(
        tx,
        payload.provider,
        oauthUser.providerId,
      );

      let user: IUser;
      if (userOAuthAccount) {
        const existingUser = await this.userRepository.findById(
          tx,
          userOAuthAccount.userId,
        );
        if (!existingUser) {
          throw new KalamcheError(KalamcheErrorType.NotFound);
        }

        user = existingUser;
      } else {
        user = await this.authUtilService.findOrCreateUser(tx, {
          email: oauthUser.email,
          name: oauthUser.name,
          roles: [USER_ROLE.USER],
        });
      }

      await this.oauthAccountRepository.insert(tx, {
        provider: payload.provider,
        providerId: oauthUser.providerId,
        userId: user.id,
      });

      const response = await this.authUtilService.generateLoginRes(
        tx,
        res,
        req,
        user,
      );
      return {
        accessToken: response.tokens.accessToken,
        user: response.user,
      };
    });
  }

  getProvider(provider: string) {
    switch (provider) {
      case "github":
        return this.githubOAuthService;
      case "discord":
        return this.discordOAuthService;
      default: {
        throw new KalamcheError(KalamcheErrorType.InvalidOAuthProvider);
      }
    }
  }
}
