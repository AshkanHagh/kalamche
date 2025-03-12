import { DynamicModule, Module } from "@nestjs/common";
import { createDrizzleConnection, DATABASE_CONNECTION } from ".";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        return createDrizzleConnection();
      },
    },
  ],

  exports: [DATABASE_CONNECTION],
})
export class DrizzleModule {
  static forTest(url?: string): DynamicModule {
    return {
      module: DrizzleModule,
      providers: [
        {
          provide: DATABASE_CONNECTION,
          useFactory: () => {
            return createDrizzleConnection(url);
          },
        },
      ],
      exports: [DATABASE_CONNECTION],
    };
  }
}
