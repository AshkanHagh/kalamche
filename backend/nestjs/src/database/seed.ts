import { Inject } from "@nestjs/common";
import { UserSchema } from "./schema";
import { Postgres } from "./types";
import { Argon2PasswordStrategy } from "src/config/auth/password/argon2-password.strategy";
import { PasswordHashStrategy } from "src/config/auth/password/password.strategy";

export class SeedDb {
  private user: any;

  constructor(
    private readonly client: Postgres,
    @Inject(Argon2PasswordStrategy)
    private passwordHasher: PasswordHashStrategy,
  ) {}

  public async setDefaultAdmin() {
    const adminPassword = "Kalamche@123";

    const user = await this.client
      .insert(UserSchema)
      .values({
        name: "Admin",
        email: "kalamche.admin@example.com",
        passwordHash: await this.passwordHasher.hash(adminPassword),
      })
      .returning();

    this.user = user;
  }

  public async setDefaultRole() {}
}
