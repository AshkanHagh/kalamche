import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InferInsertModel } from "drizzle-orm";
import { DATABASE_CONNECTION } from "src/database";
import { productSchema } from "src/database/schemas";
import { Postgres } from "src/database/types";
import { Product, ProductRecord } from "./types/product";
import { SimilarProductStores } from "./types/repository";

export type InsertProductDto = InferInsertModel<typeof productSchema>;

@Injectable()
export class ProductRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Postgres,
  ) {}

  private intoRecord(model: Product): ProductRecord {
    return {
      id: model.id,
      storeId: model.storeId,
      name: model.name,
      originalName: model.originalName,
      description: model.description,
      price: model.price,
      images: model.images,
      category: model.category,
      details: model.details,
      callbackUrl: model.callbackUrl,
      createdAt: model.createdAt,
    };
  }

  public async insert(payload: InsertProductDto): Promise<ProductRecord> {
    const product = await this.db
      .insert(productSchema)
      .values(payload)
      .returning();

    if (!product[0]) {
      throw new HttpException(
        "Faild to insert product",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return this.intoRecord(product[0]);
  }

  public async findProductById(productId: string): Promise<ProductRecord> {
    const product = await this.db.query.productSchema.findFirst({
      where: (table, funcs) => funcs.eq(table.id, productId),
      columns: {
        updatedAt: false,
      },
    });

    if (!product) {
      throw new NotFoundException();
    }

    return product;
  }

  public async findStoresByProductName(
    name: string,
    storeId: string,
  ): Promise<SimilarProductStores[]> {
    const stores = await this.db.query.productSchema.findMany({
      where: (table, funcs) => funcs.and(funcs.eq(table.originalName, name)),
      with: {
        storeSchema: {
          columns: {
            name: true,
            id: true,
          },
        },
      },
      columns: {
        name: true,
        price: true,
        id: true,
      },
      limit: 5,
    });

    return stores
      .filter(({ storeSchema }) => storeSchema.id !== storeId)
      .map(({ storeSchema, ...product }) => ({
        store: {
          name: storeSchema.name,
          id: storeSchema.id,
        },
        product: {
          name: product.name,
          price: product.price,
          id: product.id,
        },
      }));
  }
}
