import { Inject } from "@nestjs/common";
import { ConfigService } from "src/config/config.service";
import { DATABASE_CONNECTION } from "src/drizzle";
import { Postgres } from "src/drizzle/types";

export class AuthService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Postgres,
    private readonly config: ConfigService,
  ) {}

  public async autheticate() {}
}
