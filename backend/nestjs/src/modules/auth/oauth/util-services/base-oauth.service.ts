import { AuthorizationCode } from "simple-oauth2";
import { OAuthConfig, OAuthUser } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { randomBytes, timingSafeEqual } from "node:crypto";

export abstract class BaseOAuthService {
  private client: AuthorizationCode;
  private config: OAuthConfig;

  constructor(config: OAuthConfig) {
    this.config = config;
    this.client = new AuthorizationCode({
      client: {
        id: this.config.clientId,
        secret: this.config.clientSecret,
      },
      auth: {
        tokenHost: this.config.tokenHost,
        authorizeHost: this.config.authorizeHost,
        authorizePath: this.config.authorizePath,
        tokenPath: this.config.tokenPath,
      },
    });
  }

  abstract getUserInfo(accessToken: string): Promise<OAuthUser>;

  generateAuthUrl(state: string) {
    const params = {
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
    };

    return this.client.authorizeURL(params);
  }

  async exchangeCodeForTokens(code: string) {
    const tokenParams = {
      code,
      redirect_uri: this.config.redirectUri,
    };

    try {
      const result = await this.client.getToken(tokenParams);
      const accessToken: string = result.token.access_token as string;

      return {
        accessToken,
        tokenType: (result.token["type"] as string) || "Bearer",
      };
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.OAuthReqFailed, error);
    }
  }

  generateState() {
    return randomBytes(32).toString("base64url");
  }

  validateState(providedState: string, storedState: string) {
    return timingSafeEqual(
      Buffer.from(providedState),
      Buffer.from(storedState),
    );
  }
}
