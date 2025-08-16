export interface IUserService {
  me(userId: string): Promise<any>;
  likeStatus(userId: string, productId: string): Promise<boolean>;
}
