export type OAuthUser = {
  name: string;
  email: string;
  imageUrl: string;
};

export abstract class OAuthProvider {
  abstract createAuthUrl(): string;
  abstract authenticate(code: string): Promise<OAuthUser>;
}
