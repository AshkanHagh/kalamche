import { Inject, Injectable } from "@nestjs/common";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "src/database/schemas";
import { user } from "src/database/schemas";
import { eq, InferInsertModel } from "drizzle-orm";
import { User, UserRecord } from "../types";
import { DATABASE_CONNECTION } from "src/database";

export type InsertUserDto = InferInsertModel<typeof user>;

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  public intoRecord(model: User): UserRecord {
    return {
      id: model.id,
      email: model.email,
      name: model.name,
      avatarUrl: model.avatarUrl,
      createdAt: model.createdAt,
    };
  }

  public async findUserByEmail(email: string): Promise<User | undefined> {
    const user = await this.db.query.user.findFirst({
      where: (table, func) => func.eq(table.email, email),
    });

    return user;
  }

  public async insert(dto: InsertUserDto): Promise<UserRecord> {
    const newUser = await this.db.insert(user).values(dto).returning();
    if (newUser.length === 0) {
      // TODO: throw some error
      throw new Error("fake error fix me");
    }

    return this.intoRecord(newUser[0]);
  }

  public async updateRefreshToken(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.db
      .update(user)
      .set({ refreshTokenHash })
      .where(eq(user.id, userId));
  }
}
