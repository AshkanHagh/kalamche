import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/utils/exeption.filter";
import { splitReqLog } from "./common/middlewares/req-log-split";
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.use(splitReqLog);
  app.useGlobalFilters(new AllExceptionsFilter());

  // TODO: complete docs after store crud
  const config = new DocumentBuilder()
    .setTitle("Kalamche api docs")
    .setDescription("Test")
    .setVersion("1")
    .addTag("Kalamche")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("swagger", app, documentFactory, {
    jsonDocumentUrl: "swagger/json",
  });

  await app.listen(process.env.PORT ?? 7175);
}
bootstrap();
