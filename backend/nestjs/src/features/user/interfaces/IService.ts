export interface IUserService {
  me(userId: string): Promise<any>;
}
