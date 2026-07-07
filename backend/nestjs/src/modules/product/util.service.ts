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
import { and, eq, inArray } from "drizzle-orm";
import { CreateProductDto } from "./dto";
import { MAX_PRODUCT_IMAGE_COUNT } from "../attachment/constants";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { FrTokenService } from "../fr-token/fr-token.service";

@Injectable()
export class ProductUtilService {
  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
    private frTokenService: FrTokenService,
  ) {}

  // thumbnail upload and image upload count will be checked here
  async setProductImages(tx: Database, imagesId: string[], productId: string) {
    const uploadedImages = await tx.query.AnonymouseImageTable.findMany({
      where: and(
        inArray(AnonymouseImageTable.id, imagesId),
        eq(AnonymouseImageTable.usage, "product"),
      ),
    });

    const uploadedImagesCount = uploadedImages.filter(
      (image) => !image.isThumbnail,
    ).length;
    const thumbnailsCount = uploadedImages.filter(
      (image) => image.isThumbnail,
    ).length;
    if (thumbnailsCount > 1) {
      throw new KalamcheError(KalamcheErrorType.ImageLimitExceeded);
    }
    if (uploadedImagesCount >= MAX_PRODUCT_IMAGE_COUNT) {
      throw new KalamcheError(KalamcheErrorType.ImageLimitExceeded);
    }

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
        eq(ProductOfferTable.byboxWinner, true),
      ),
    });
    let isByboxWinner = false;
    if (offer && payload.finalPrice <= offer.finalPrice) {
      // if no offer is in range of new offer, set by box winner to true
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
        redirectPageUrl: this.frTokenService.generateRedirectUrl(offer!.id),
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
