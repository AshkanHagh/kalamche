import { Inject, Injectable } from "@nestjs/common";
import { IOAuthStateRepo } from "../interfaces/IOAuthStateRepo";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { IOAuthStateInsertForm, OAuthStateTable } from "src/drizzle/schemas";

@Injectable()
export class OAuthStateRepository implements IOAuthStateRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async insert(form: IOAuthStateInsertForm): Promise<void> {
    await this.db.insert(OAuthStateTable).values(form).execute();
  }
}
