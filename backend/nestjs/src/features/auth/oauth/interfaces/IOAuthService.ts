export interface IOAuthService {
  initiateOAuth(provider: string): Promise<string>;
}
