import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly AUDIENCE: string = "KALAMCHE_BACKEND";

  constructor(private readonly config: ConfigService) {
    this.accessTokenSecret = this.config.get<string>("ACCESS_TOKEN_SECRET")!;
    this.refreshTokenSecret = this.config.get<string>("REFRESH_TOKEN_SECRET")!;
  }

  public signAccessToken(userId: string): string {
    return jwt.sign({ userId }, this.accessTokenSecret, {
      expiresIn: `15m`,
      audience: this.AUDIENCE,
    });
  }

  public signRefreshToken(userId: string): string {
    return jwt.sign({ userId }, this.refreshTokenSecret, {
      expiresIn: `7d`,
      audience: this.AUDIENCE,
    });
  }
}
