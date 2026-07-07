import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { UpdateUserDto } from "./dto";
import { ProductLikeTable, UserTable } from "src/drizzle/schemas";
import { eq, and } from "drizzle-orm";

@Injectable()
export class UserService {
  constructor(@Inject(DATABASE) private db: Database) {}

  async me(userId: string) {
    return await this.db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
      columns: {
        passwordHash: false,
      },
      with: {
        wallet: true,
      },
    });
  }

  async likeStatus(userId: string, productId: string): Promise<boolean> {
    const liked = await this.db.query.ProductLikeTable.findFirst({
      where: and(
        eq(ProductLikeTable.userId, userId),
        eq(ProductLikeTable.productId, productId),
      ),
    });
    return !!liked;
  }

  async updateUser(userId: string, payload: UpdateUserDto): Promise<any> {
    const [user] = await this.db
      .update(UserTable)
      .set(payload)
      .where(eq(UserTable.id, userId))
      .returning();
    const { passwordHash: _, ...result } = user;
    return result;
  }
}
