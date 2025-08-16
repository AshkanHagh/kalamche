export interface IUserController {
  me(userId: string): Promise<any>;
  likeStatus(userId: string, productId: string): Promise<{ liked: boolean }>;
}
