import "dotenv/config";
import "./instrument";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import compression from "compression";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: process.env.KAFKA_BROKERS_URI!.split(","),
      },
      consumer: {
        groupId: "meilisearch-indexer",
      },
    },
  });

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

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 8399);
}
bootstrap();
