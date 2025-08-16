import { Inject, Injectable } from "@nestjs/common";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import {
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
  PendingUserTable,
} from "src/drizzle/schemas";
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
    tx: Database,
    id: string,
    form?: IPendingUserUpdateForm,
  ): Promise<IPendingUser> {
    const [user] = await tx
      .update(PendingUserTable)
      .set(form || { createdAt: new Date() })
      .where(eq(PendingUserTable.id, id))
      .returning();

    return user;
  }

  async insert(
    tx: Database,
    form: IPendingUserInsertForm,
  ): Promise<IPendingUser> {
    const [user] = await tx.insert(PendingUserTable).values(form).returning();

    return user;
  }

  async findById(id: string): Promise<IPendingUser | undefined> {
    const [user] = await this.db
      .select()
      .from(PendingUserTable)
      .where(eq(PendingUserTable.id, id));

    return user;
  }

  async deleteByEmail(tx: Database, email: string): Promise<IPendingUser> {
    const [user] = await tx
      .delete(PendingUserTable)
      .where(eq(PendingUserTable.email, email))
      .returning();

    return user;
  }

  async delete(tx: Database, id: string): Promise<IPendingUser> {
    const [user] = await tx
      .delete(PendingUserTable)
      .where(eq(PendingUserTable.id, id))
      .returning();

    return user;
  }
}
