import { Inject, Injectable } from "@nestjs/common";
import { GithubOAuthService } from "./util-services/github-oauth.service";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { Request, Response } from "express";
import { getElapsedTime } from "src/utils/elapsed-time";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { AuthUtilService } from "../util.service";
import { DiscordOAuthService } from "./util-services/discrod-oauth.service";
import { HandleCallbackDto } from "./dto";
import {
  IUser,
  OAuthAccountTable,
  OAuthStateTable,
  UserTable,
} from "src/drizzle/schemas";
import { and, eq } from "drizzle-orm";
import { USER_ROLE } from "src/constants/global.constant";

@Injectable()
export class OAuthService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private githubOAuthService: GithubOAuthService,
    private discordOAuthService: DiscordOAuthService,
    private authUtilService: AuthUtilService,
  ) {}

  async initiateOAuth(providerName: string) {
    const provider = this.getProvider(providerName);
    const state = provider.generateState();

    return await this.db.transaction(async (tx) => {
      await tx
        .insert(OAuthStateTable)
        .values({
          provider: providerName,
          state,
        })
        .execute();

      return provider.generateAuthUrl(state);
    });
  }

  async handleCallback(
    req: Request,
    res: Response,
    payload: HandleCallbackDto,
  ) {
    const provider = this.getProvider(payload.provider);

    const accountState = await this.db.query.OAuthStateTable.findFirst({
      where: and(
        eq(OAuthStateTable.provider, payload.provider),
        eq(OAuthStateTable.state, payload.state),
      ),
    });
    if (!accountState) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    if (getElapsedTime(accountState.createdAt, "minutes") > 10) {
      await this.db
        .delete(OAuthStateTable)
        .where(eq(OAuthStateTable.id, accountState.id));
      throw new KalamcheError(KalamcheErrorType.StateExpired);
    }

    if (!provider.validateState(payload.state, accountState.state)) {
      throw new KalamcheError(KalamcheErrorType.InvalidOAuthState);
    }
    const result = await provider.exchangeCodeForTokens(payload.code);
    const oauthUser = await provider.getUserInfo(result.accessToken);

    return await this.db.transaction(async (tx) => {
      await tx
        .delete(OAuthStateTable)
        .where(eq(OAuthStateTable.id, accountState.id));

      const oauthAccount = await tx.query.OAuthAccountTable.findFirst({
        where: and(
          eq(OAuthAccountTable.provider, payload.provider),
          eq(OAuthAccountTable.providerId, oauthUser.providerId),
        ),
      });

      let user: IUser;
      if (oauthAccount) {
        const existingUser = await this.db.query.UserTable.findFirst({
          where: eq(UserTable.id, oauthAccount.userId),
        });
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

      await tx.insert(OAuthAccountTable).values({
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
