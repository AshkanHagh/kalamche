import { UpdateUserDto } from "../dto";

export interface IUserController {
  me(userId: string): Promise<any>;
  likeStatus(userId: string, productId: string): Promise<{ liked: boolean }>;
  updateUser(userId: string, payload: UpdateUserDto): Promise<any>;
}
