import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import {
  IUserLoginToken,
  IUserLoginTokenInsertForm,
  UserLoginTokenTable,
} from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { IUserLoginTokenRepo } from "../interfaces/IUserLoginTokenRepo";

@Injectable()
export class UserLoginTokenRepository implements IUserLoginTokenRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findByUserId(userId: string): Promise<IUserLoginToken> {
    const [token] = await this.db
      .select()
      .from(UserLoginTokenTable)
      .where(eq(UserLoginTokenTable.userId, userId));

    if (!token) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return token;
  }

  // when login token for user already exists, for now we update the existing data,
  // TODO: check for others ways like adding another row of data for new user login token
  // this can be helpful for tracking user stolen tokens
  async insertOrUpdate(
    tx: Database,
    form: IUserLoginTokenInsertForm,
  ): Promise<IUserLoginToken> {
    const [token] = await tx
      .insert(UserLoginTokenTable)
      .values(form)
      .onConflictDoUpdate({
        target: UserLoginTokenTable.userId,
        set: {
          createdAt: new Date(),
          userAgent: form.userAgent,
          ip: form.ip,
          token: form.token,
        },
      })
      .returning();

    return token;
  }
}
