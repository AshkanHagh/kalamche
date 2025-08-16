import { UpdateUserDto } from "../dto";

export interface IUserService {
  me(userId: string): Promise<any>;
  likeStatus(userId: string, productId: string): Promise<boolean>;
  updateUser(userId: string, payload: UpdateUserDto): Promise<any>;
}
