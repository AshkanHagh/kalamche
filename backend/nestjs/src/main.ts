import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { migration } from "./drizzle/migration";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { KalamcheExceptionsFilter } from "./common/error/kalamche-exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new KalamcheExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 6399);
}

migration();
bootstrap();
