import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { KafkaRetriableException } from "@nestjs/microservices";
import { eq } from "drizzle-orm";
import { Index, Meilisearch, TaskUidOrEnqueuedTask } from "meilisearch";
import { DbConfig, type IDbConfig } from "src/config/db.config";
import { DATABASE } from "src/drizzle/constants";
import {
  ProductImageTable,
  ProductOfferTable,
  ProductTable,
} from "src/drizzle/schemas";
import { type Database } from "src/drizzle/types";
import { KalamcheErrorType } from "src/filters/exception";

export type ProductSearchDocument = {
  id: string;
  shopId: string | null;
  title: string;
  description: string;
  status: "draft" | "public";
  categoryId: string;
  brandName: string;
  specifications: {
    key: string;
    value: string;
  }[];
  initialPrice: number;
  finalPrice: number;
  modelNumber: string;
  asin: string;
  upc: string | null;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  createdAt: number;
};

@Injectable()
export class SearchService implements OnModuleInit {
  private logger = new Logger(SearchService.name);
  private client: Meilisearch;
  productIndex: Index;

  constructor(
    @DbConfig() dbConfig: IDbConfig,
    @Inject(DATABASE) private db: Database,
  ) {
    this.client = new Meilisearch(dbConfig.meilisearch);
    this.productIndex = this.client.index("products");
  }

  async onModuleInit() {
    await this.client.createIndex("products", {
      primaryKey: "id",
    });
    await this.productIndex.updateSettings({
      searchableAttributes: [
        "title",
        "brandName",
        "description",
        "modelNumber",
        "asin",
        "upc",
        "specifications.value",
      ],
      filterableAttributes: [
        "id",
        "status",
        "categoryId",
        "brandName",
        "finalPrice",
      ],
      sortableAttributes: [
        "initialPrice",
        "createdAt",
        "likeCount",
        "viewCount",
      ],
    });
  }

  // TODO: implement a retry logic here
  private async runWithRetry(fn: () => Promise<TaskUidOrEnqueuedTask>) {
    try {
      const taskId = await fn();

      const task = await this.client.tasks.waitForTask(taskId, {
        interval: 50,
        timeout: 5000,
      });
      if (task.status != "succeeded") {
        throw new Error(
          `indexing product doc ${task.uid} failed: ${task.error?.message}`,
        );
      }
    } catch (e) {
      const error = e as Error;
      this.logger.error({
        type: "kafka",
        errorType: KalamcheErrorType.ProductIndexFailed,
        message: error.message,
      });
      throw new KafkaRetriableException(KalamcheErrorType.ProductIndexFailed);
    }
  }

  async indexProduct(productId: string) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
      with: {
        brand: true,
        likes: {
          columns: { productId: true },
        },
        views: {
          columns: {
            id: true,
          },
        },
        images: {
          where: eq(ProductImageTable.isThumbnail, true),
        },
        offers: {
          where: eq(ProductOfferTable.byboxWinner, true),
        },
      },
      columns: {
        updatedAt: false,
        brandId: false,
      },
    });

    const { likes, views, offers, brand, images, ...rest } = product!;
    const doc: ProductSearchDocument = {
      ...rest,
      createdAt: rest.createdAt.getTime(),
      brandName: brand.name,
      likeCount: likes.length,
      viewCount: views.length,
      finalPrice: offers[0].finalPrice,
      thumbnailUrl: images[0].url,
    };
    await this.runWithRetry(async () => {
      const result = await this.productIndex.addDocuments([doc]);
      return result.taskUid;
    });
  }

  async updateProductOffer(productId: string) {
    const product = await this.db.query.ProductTable.findFirst({
      where: eq(ProductTable.id, productId),
      with: {
        offers: {
          where: eq(ProductOfferTable.byboxWinner, true),
        },
      },
      columns: {},
    });
    await this.runWithRetry(async () => {
      const result = await this.productIndex.updateDocuments([
        {
          id: productId,
          finalPrice: product!.offers[0].finalPrice,
        },
      ]);
      return result.taskUid;
    });
  }

  async deleteProduct(productId: string) {
    await this.runWithRetry(async () => {
      const result = await this.productIndex.deleteDocument(productId);
      return result.taskUid;
    });
  }
}
