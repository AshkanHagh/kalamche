import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/utils/exeption.filter";
import { splitReqLog } from "./common/middlewares/req-log-split";
import * as cookieParser from "cookie-parser";
import { MapResponseInterceptor } from "./common/interceptors/map-response";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(splitReqLog);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new MapResponseInterceptor());

  await app.listen(process.env.PORT ?? 7175);
}
bootstrap();
