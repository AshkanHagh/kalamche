import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => UserModule)],
  exports: [AuthModule, UserModule],
})
export class CoreModule {}
