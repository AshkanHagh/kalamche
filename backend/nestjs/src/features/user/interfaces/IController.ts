export interface IUserController {
  me(userId: string): Promise<any>;
}
