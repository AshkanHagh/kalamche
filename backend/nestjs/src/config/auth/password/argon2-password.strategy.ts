import { PasswordHashStrategy } from "./password.strategy";
import * as argon2 from "argon2";

export class Argon2PasswordStrategy implements PasswordHashStrategy {
  async hash(plaintext: string): Promise<string> {
    return await argon2.hash(plaintext);
  }

  async check(plaintext: string, hash: string): Promise<boolean> {
    return await argon2.verify(hash, plaintext);
  }
}
