import { Inject, Injectable } from "@nestjs/common";
import { IPendingUserRepository } from "../interfaces/repository";
import {
  Database,
  IPendingUser,
  IPendingUserInsertForm,
  IPendingUserUpdateForm,
} from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { PendingUserTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";

@Injectable()
export class PendingUserRepository implements IPendingUserRepository {
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
}
