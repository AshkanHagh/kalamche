import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { migration } from "./drizzle/migration";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 6399);
}

migration();
bootstrap();
