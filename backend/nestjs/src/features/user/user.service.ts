import { Inject, Injectable } from "@nestjs/common";
import { IUserService } from "./interfaces/IService";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";

@Injectable()
export class UserService implements IUserService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async me(userId: string) {
    const result = await this.db.query.UserTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, userId),
      columns: {
        passwordHash: false,
      },
      with: {
        wallet: true,
      },
    });

    return result;
  }
}
