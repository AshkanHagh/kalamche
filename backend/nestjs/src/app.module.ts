import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./features/auth/auth.module";
import { RepositoryModule } from "./repository/repository.module";
import { EmailModule } from "./features/email/email.module";

@Module({
  imports: [
    ConfigModule.register(),
    DrizzleModule,
    AuthModule,
    RepositoryModule,
    EmailModule,
  ],
})
export class AppModule {}
