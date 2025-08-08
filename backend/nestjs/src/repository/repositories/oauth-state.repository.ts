import { Inject, Injectable } from "@nestjs/common";
import { IOAuthStateRepo } from "../interfaces/IOAuthStateRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IOAuthStateInsertForm, OAuthStateTable } from "src/drizzle/schemas";
import { and, eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

@Injectable()
export class OAuthStateRepository implements IOAuthStateRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(tx: Database, form: IOAuthStateInsertForm) {
    await tx.insert(OAuthStateTable).values(form).execute();
  }

  async findByState(providerName: string, state: string) {
    const [oauthState] = await this.db
      .select()
      .from(OAuthStateTable)
      .where(
        and(
          eq(OAuthStateTable.provider, providerName),
          eq(OAuthStateTable.state, state),
        ),
      );

    if (!oauthState) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }

    return oauthState;
  }

  async delete(tx: Database, id: string) {
    await tx
      .delete(OAuthStateTable)
      .where(eq(OAuthStateTable.id, id))
      .execute();
  }
}
