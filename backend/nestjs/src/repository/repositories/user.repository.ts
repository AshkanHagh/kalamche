import { Inject, Injectable } from "@nestjs/common";
import {
  Database,
  IUser,
  IUserInsertForm,
  IUserUpdateForm,
} from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { UserTable } from "src/drizzle/schemas";
import { eq, sql } from "drizzle-orm";
import { IUserRepo } from "../interfaces/IUserRepo";

@Injectable()
export class UserRepository implements IUserRepo {
  constructor(@Inject(DATABASE) private db: Database) {}

  async emailExists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.email, email));

    return user !== undefined;
  }

  async findByEmail(email: string, tx?: Database): Promise<IUser | undefined> {
    const db = tx || this.db;
    const [user] = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    return user;
  }

  async insert(form: IUserInsertForm, tx?: Database): Promise<IUser> {
    const db = tx || this.db;

    const [user] = await db.insert(UserTable).values(form).returning();
    return user;
  }

  async findById(id: string, tx?: Database): Promise<IUser | undefined> {
    const db = tx || this.db;
    const [user] = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.id, id));

    return user;
  }

  async update(id: string, form: IUserUpdateForm): Promise<IUser> {
    const [user] = await this.db
      .update(UserTable)
      .set(form)
      .where(eq(UserTable.id, id))
      .returning();

    return user;
  }

  async updateRole(tx: Database, id: string, role: string): Promise<void> {
    await tx
      .update(UserTable)
      .set({ roles: sql`array_append(roles, ${role})` })
      .where(eq(UserTable.id, id))
      .execute();
  }

  async removeRoles(tx: Database, id: string, roles: string[]) {
    await tx
      .update(UserTable)
      .set({
        roles: sql`(
          SELECT ARRAY_AGG(elem)
          FROM UNNEST(${UserTable.roles}) AS elem
          WHERE elem NOT IN (${roles.join(", ")})
        )`,
      })
      .where(eq(UserTable.id, id))
      .execute();
  }
}
