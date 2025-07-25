import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { UserRepository } from "./repositories/user.repository";
import { PendingUserRepository } from "./repositories/pending-user.repository";
import { UserLoginTokenRepository } from "./repositories/user-login-token.repository";
import { ProductRepository } from "./repositories/product.repository";
import { ShopRepository } from "./repositories/shop.repository";
import { TempProductRepository } from "./repositories/temp-product.repository";
import { ProductOfferRepository } from "./repositories/product-offer.repository";
import { ProductImageRepository } from "./repositories/product-image.repository";
import { OAuthStateRepository } from "./repositories/oauth-state.repository";
import { OAuthAccountRepository } from "./repositories/oauth-account.repository";

const repositories = [
  UserRepository,
  PendingUserRepository,
  UserLoginTokenRepository,
  ProductRepository,
  ShopRepository,
  TempProductRepository,
  ProductOfferRepository,
  ProductImageRepository,
  OAuthStateRepository,
  OAuthAccountRepository,
];

@Module({
  imports: [DrizzleModule],
  providers: repositories,
  exports: repositories,
})
export class RepositoryModule {}
