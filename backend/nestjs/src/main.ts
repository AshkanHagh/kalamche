import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { migration } from "./drizzle/migration";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";
import { AllExceptionsFilter } from "./common/error/all-exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 6399);
}

migration();
bootstrap();
