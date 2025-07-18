import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { RepositoryModule } from "./repository/repository.module";
import { EmailModule } from "./modules/email/email.module";
import { ProductModule } from "./modules/product/product.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ShopModule } from "./modules/shop/shop.module";

@Module({
  imports: [
    ConfigModule.register(),
    ScheduleModule.forRoot(),
    DrizzleModule,
    AuthModule,
    RepositoryModule,
    EmailModule,
    ProductModule,
    ShopModule,
  ],
})
export class AppModule {}
