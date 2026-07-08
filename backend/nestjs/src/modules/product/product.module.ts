import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { ProductUtilService } from "./util.service";
import { AttachmentModule } from "../attachment/attachment.module";
import { RateLimitModule } from "../rate-limit/rate-limit.module";
import { FrTokenModule } from "../fr-token/fr-token.module";
import { SearchService } from "./search/search.service";
import { SearchController } from "./search/search.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [
    FrTokenModule,
    AttachmentModule,
    RateLimitModule.forFeature({
      mode: "DRY_MODE",
      keyExtractor: "userId",
      bucketSize: 100,
      refillRate: 1000 * 30,
    }),
    ClientsModule.register([
      {
        name: "KAFKA_SERVICE",
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: process.env.KAFKA_BROKERS_URI!.split(","),
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [ProductController, SearchController],
  providers: [ProductService, ProductUtilService, SearchService],
})
export class ProductModule {}
