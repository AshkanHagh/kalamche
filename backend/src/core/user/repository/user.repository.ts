import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { eq, InferInsertModel } from "drizzle-orm";
import { User, UserRecord } from "../types";
import { DATABASE_CONNECTION } from "src/database";
import { Postgres } from "src/database/types";
import { userSchema } from "src/database/schemas";

export type InsertUserDto = InferInsertModel<typeof userSchema>;

@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Postgres,
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
    const user = await this.db.query.userSchema.findFirst({
      where: (table, func) => func.eq(table.email, email),
    });

    return user;
  }

  public async insert(dto: InsertUserDto): Promise<UserRecord> {
    const newUser = await this.db.insert(userSchema).values(dto).returning();
    if (newUser.length === 0) {
      throw new HttpException("Faild to insert user", HttpStatus.BAD_REQUEST);
    }

    return this.intoRecord(newUser[0]);
  }

  public async updateRefreshToken(
    userId: string,
    refreshTokenHash: string,
  ): Promise<void> {
    await this.db
      .update(userSchema)
      .set({ refreshTokenHash })
      .where(eq(userSchema.id, userId));
  }

  public async findRefreshToken(userId: string): Promise<string> {
    const refreshToken = await this.db.query.userSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, userId),
      columns: {
        refreshTokenHash: true,
      },
    });

    if (!refreshToken) {
      throw new NotFoundException();
    }

    if (!refreshToken.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    return refreshToken.refreshTokenHash;
  }

  public async findUserById(userId: string): Promise<UserRecord> {
    const user = await this.db.query.userSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, userId),
    });

    if (!user) {
      throw new NotFoundException();
    }

    return this.intoRecord(user);
  }
}
