import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { KalamcheExceptionFilter } from "./filters/exception-filter";
import cookieParser from "cookie-parser";

// TODO(optional): write testing for verification email registration
// TODO: refactor testings to use test container
// TODO: add search
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(<CorsOptions>{
    credentials: true,
    origin: "*",
  });
  app.useGlobalFilters(new KalamcheExceptionFilter());
  app.setGlobalPrefix("/api/v1");
  app.use(cookieParser());
  // enable on production(if you are using proxy)
  // app.use("trust proxy", true);

  await app.listen(process.env.PORT ?? 8399);
}
bootstrap();
