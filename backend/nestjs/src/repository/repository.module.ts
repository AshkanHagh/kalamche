import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./repositories/user.repository";
import { PendingUserRepository } from "./repositories/pending-user.repository";
import { UserLoginTokenRepository } from "./repositories/user-login-token.repository";
import { ProductRepository } from "./repositories/product.repository";
import { ShopRepository } from "./repositories/shop.repository";

const repositories = [
  UserRepository,
  PendingUserRepository,
  UserLoginTokenRepository,
  ProductRepository,
  ShopRepository,
];

@Module({
  imports: [DrizzleModule],
  providers: repositories,
  exports: repositories,
})
export class RepositoryModule {}
