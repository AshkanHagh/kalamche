import { Inject, Injectable } from "@nestjs/common";
import { S3Service } from "../attachment/services/s3.service";
import { Database } from "src/drizzle/types";
import { DATABASE } from "src/drizzle/constants";
import {
  AnonymouseImageTable,
  ProductImageInsertForm,
  ProductImageTable,
  ProductOfferTable,
} from "src/drizzle/schemas";
import { and, eq, inArray, lte } from "drizzle-orm";
import { CreateProductDto } from "./dto";

@Injectable()
export class ProductUtilService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
  ) {}

  async setProductImages(tx: Database, imagesId: string[], productId: string) {
    const uploadedImages = await tx.query.AnonymouseImageTable.findMany({
      where: and(
        inArray(AnonymouseImageTable.userId, imagesId),
        eq(AnonymouseImageTable.usage, "product"),
      ),
    });

    const imagesForm: ProductImageInsertForm[] = [];
    await Promise.all(
      uploadedImages.map(async (image) => {
        await this.s3Service.removeImageTempFlag(image.id);
        imagesForm.push({
          productId,
          isThumbnail: image.isThumbnail!,
          id: image.id,
          url: image.url,
        });
      }),
    );
    await tx.insert(ProductImageTable).values(imagesForm);
  }

  async createProductOffer(
    tx: Database,
    productId: string,
    shopId: string,
    payload: Pick<CreateProductDto, "finalPrice" | "title" | "websiteUrl">,
  ) {
    const offer = await this.db.query.ProductOfferTable.findFirst({
      where: and(
        eq(ProductOfferTable.productId, productId),
        lte(ProductOfferTable.finalPrice, payload.finalPrice),
      ),
    });

    let isByboxWinner = false;

    if (!offer) {
      isByboxWinner = true;
      // removing anyone that is bybox winner to set new by box winner
      await tx
        .update(ProductOfferTable)
        .set({ byboxWinner: false })
        .where(eq(ProductOfferTable.productId, productId));
    }

    await tx
      .insert(ProductOfferTable)
      .values({
        // TODO: missing redirect url
        redirectPageUrl: "",
        finalPrice: payload.finalPrice,
        pageUrl: payload.websiteUrl,
        productId,
        shopId,
        title: payload.title,
        status: "active",
        byboxWinner: isByboxWinner,
      })
      .returning();
  }
}
