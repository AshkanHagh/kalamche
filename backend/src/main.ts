import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/utils/exeption.filter";
import { splitReqLog } from "./common/middlewares/req-log-split";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(splitReqLog);
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 7175);
}
bootstrap();
