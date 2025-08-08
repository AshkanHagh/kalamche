import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { KalamcheExceptionFilter } from "./filters/exception-filter";
import cookieParser from "cookie-parser";
import { patchNestJsSwagger } from "nestjs-zod";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  patchNestJsSwagger();

  const app = await NestFactory.create(AppModule);

  app.enableCors(<CorsOptions>{
    credentials: true,
    origin: process.env.CORS_ORIGIN,
  });
  app.useGlobalFilters(new KalamcheExceptionFilter());
  app.setGlobalPrefix("/api/v1");
  app.use(cookieParser());
  // enable on production(if you are using proxy)
  // app.use("trust proxy", true);

  if (process.env.NODE !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Kalamche api")
      .setDescription("API with auto-generated documentation from Zod schemas")
      .setVersion("1.0.0")
      .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("/docs", app, documentFactory);
  }

  await app.listen(process.env.PORT ?? 8399);
}
bootstrap();
