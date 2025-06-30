import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { KalamcheExceptionFilter } from "./filters/exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(<CorsOptions>{
    credentials: true,
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
  app.useGlobalFilters(new KalamcheExceptionFilter());
  app.setGlobalPrefix("/api/v1");

  await app.listen(process.env.PORT ?? 8399);
}
bootstrap();
