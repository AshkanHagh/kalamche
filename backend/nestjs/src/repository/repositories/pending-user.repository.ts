import { Inject, Injectable } from "@nestjs/common";
import {
  Database,
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
} from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { PendingUserTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { IPendingUserRepo } from "../interfaces/IPendingUserRepo";

@Injectable()
export class PendingUserRepository implements IPendingUserRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async findByEmail(email: string): Promise<IPendingUser | undefined> {
    const [pendingUser] = await this.db
      .select()
      .from(PendingUserTable)
      .where(eq(PendingUserTable.email, email));

    return pendingUser;
  }

  async update(
    id: string,
    form?: IPendingUserUpdateForm,
  ): Promise<IPendingUser> {
    const [user] = await this.db
      .update(PendingUserTable)
      .set(form || { createdAt: new Date() })
      .where(eq(PendingUserTable.id, id))
      .returning();

    return user;
  }

  async insert(form: IPendingUserInsertForm): Promise<IPendingUser> {
    const [user] = await this.db
      .insert(PendingUserTable)
      .values(form)
      .returning();

    return user;
  }

  async findById(id: string): Promise<IPendingUser | undefined> {
    const [user] = await this.db
      .select()
      .from(PendingUserTable)
      .where(eq(PendingUserTable.id, id));

    return user;
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(PendingUserTable).where(eq(PendingUserTable.id, id));
  }
}
