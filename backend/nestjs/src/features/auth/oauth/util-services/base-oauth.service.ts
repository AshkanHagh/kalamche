import { AuthorizationCode } from "simple-oauth2";
import { IOAuthConfig } from "../types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { OAUthUserDto } from "../dto";

export abstract class BaseOAuthService {
  private client: AuthorizationCode;
  private config: IOAuthConfig;

  constructor(config: IOAuthConfig) {
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

  abstract getUserInfo(accessToken: string): Promise<OAUthUserDto>;

  generateAuthUrl(state: string, codeVerifier?: string) {
    const params = {
      redirect_url: this.config.redirectUri,
      scope: this.config.scopes.join(" "),
      state,
    };

    return this.client.authorizeURL(params);
  }

  async exchangeCodeForTokens(code: string, codeVerifier?: string) {
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

  generateCodeVerifier() {
    return randomBytes(32).toString("base64url");
  }

  validateState(providedState: string, storedState: string) {
    return timingSafeEqual(
      Buffer.from(providedState),
      Buffer.from(storedState),
    );
  }
}
