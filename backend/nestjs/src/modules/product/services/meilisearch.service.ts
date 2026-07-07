import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { Index, Meilisearch } from "meilisearch";
import { DbConfig, type IDbConfig } from "src/config/db.config";
import { DATABASE } from "src/drizzle/constants";
import {
  ProductImageTable,
  ProductOfferTable,
  ProductTable,
} from "src/drizzle/schemas";
import { type Database } from "src/drizzle/types";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

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
export class MeilisearchService implements OnModuleInit {
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
      filterableAttributes: ["status", "categoryId", "brandName", "finalPrice"],
      sortableAttributes: [
        "initialPrice",
        "createdAt",
        "likeCount",
        "viewCount",
      ],
    });
  }

  async addNewDoc(productId: string) {
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
    try {
      await this.productIndex.addDocuments([doc]);
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ProductIndexFailed, error);
    }
  }

  async updateDoc(productId: string, payload: Partial<ProductSearchDocument>) {
    try {
      await this.productIndex.updateDocuments([
        {
          id: productId,
          ...payload,
        },
      ]);
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ProductIndexFailed, error);
    }
  }
}
