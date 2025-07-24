export interface IOAuthController {
  initiateOAuth(provider: string): Promise<{ url: string }>;
}
