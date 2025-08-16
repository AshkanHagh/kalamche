import { Inject, Injectable } from "@nestjs/common";
import { IUserService } from "./interfaces/IService";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { ProductLikeRepository } from "src/repository/repositories/product-like.repository";
import { UpdateUserDto } from "./dto";
import { UserRepository } from "src/repository/repositories/user.repository";

@Injectable()
export class UserService implements IUserService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private productLikeRepository: ProductLikeRepository,
    private userRepository: UserRepository,
  ) {}

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

  async likeStatus(userId: string, productId: string): Promise<boolean> {
    return await this.productLikeRepository.exists(userId, productId);
  }

  async updateUser(userId: string, payload: UpdateUserDto): Promise<any> {
    console.log(payload);
    const { passwordHash, ...result } = await this.userRepository.update(
      userId,
      { ...payload },
    );

    return result;
  }
}
