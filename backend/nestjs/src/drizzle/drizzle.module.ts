import { DynamicModule, Module } from "@nestjs/common";
import { createPool, DATABASE_CONNECTION } from ".";

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: () => {
        return createPool();
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
            return createPool(url);
          },
        },
      ],
      exports: [DATABASE_CONNECTION],
    };
  }
}
