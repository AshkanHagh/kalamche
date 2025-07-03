import { Inject, Injectable } from "@nestjs/common";
import { IUserRepository } from "../interfaces/repository";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import { UserTable } from "src/drizzle/schemas";
import { eq } from "drizzle-orm";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@Inject(DATABASE) private db: Database) {}

  async emailExists(email: string): Promise<boolean> {
    const [user] = await this.db
      .select({ id: UserTable.id })
      .from(UserTable)
      .where(eq(UserTable.email, email));

    return user !== undefined;
  }
}
