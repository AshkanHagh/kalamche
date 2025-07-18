import { Inject, Injectable } from "@nestjs/common";
import {
  Database,
  IUser,
  IUserInsertForm,
  IUserUpdateForm,
  IUserView,
} from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { UserTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
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

  async findByEmail(email: string): Promise<IUser | undefined> {
    const [user] = await this.db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email));

    return user;
  }

  async findUserView(id: string): Promise<IUserView> {
    const userView = await this.db.query.UserTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, id),
      columns: { passwordHash: false, updatedAt: false },
    });

    if (!userView) {
      throw new KalamcheError(KalamcheErrorType.NotFound);
    }
    return {
      user: userView,
    };
  }

  async insert(form: IUserInsertForm): Promise<IUser> {
    const [user] = await this.db.insert(UserTable).values(form).returning();
    return user;
  }

  async findById(id: string): Promise<IUser | undefined> {
    const [user] = await this.db
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
}
