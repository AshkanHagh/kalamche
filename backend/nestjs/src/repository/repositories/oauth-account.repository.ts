import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IOAuthAccountRepo } from "../interfaces/IOAuthAccountRepo";
import {
  IOAuthAccountInsertForm,
  OAuthAccountTable,
} from "src/drizzle/schemas";
import { and, eq } from "drizzle-orm";

@Injectable()
export class OAuthAccountRepository implements IOAuthAccountRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findByProvider(tx: Database, providerName: string, providerId: string) {
    const [account] = await tx
      .select()
      .from(OAuthAccountTable)
      .where(
        and(
          eq(OAuthAccountTable.provider, providerName),
          eq(OAuthAccountTable.providerId, providerId),
        ),
      );

    return account;
  }

  async insert(tx: Database, form: IOAuthAccountInsertForm) {
    const [account] = await tx
      .insert(OAuthAccountTable)
      .values(form)
      .returning();

    return account;
  }
}
