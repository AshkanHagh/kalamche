import "./instrument";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import compression from "compression";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix("/api/v1");
  app.use(cookieParser());
  app.use(compression());
  // enable on production(if you are using proxy)
  // app.use("trust proxy", true);

  await app.listen(process.env.PORT ?? 8399);
}
bootstrap();
