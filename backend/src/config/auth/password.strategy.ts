export interface PasswordHashStrategy {
  hash(plaintext: string): Promise<string>;
  check(plaintext: string, hash: string): Promise<boolean>;
}
