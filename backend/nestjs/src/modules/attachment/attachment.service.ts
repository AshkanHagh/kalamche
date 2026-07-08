import { Inject, Injectable } from "@nestjs/common";
import { DATABASE } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { S3Service } from "./services/s3.service";
import { eq } from "drizzle-orm";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";
import { randomUUID } from "node:crypto";
import { AnonymouseImageTable, ShopTable } from "src/drizzle/schemas";
import Piscina from "piscina";
import { join } from "node:path";
import { ImageResize } from "./image-resize.worker";

@Injectable()
export class AttachmentService {
  private worker: Piscina;

  constructor(
    @Inject(DATABASE) private db: Database,
    private s3Service: S3Service,
  ) {
    this.worker = new Piscina({
      filename: join(__dirname, "image-resize.worker.js"),
      minThreads: 1,
      maxThreads: 5,
    });
  }

  // in shop upload image, user can only have 1 active image upload session
  async anonymouseShopImage(userId: string, buffer: Buffer) {
    const uploads = await this.db.query.AnonymouseImageTable.findFirst({
      where: eq(AnonymouseImageTable.userId, userId),
    });
    if (uploads) {
      throw new KalamcheError(KalamcheErrorType.UploadLimitReached);
    }

    const imageId = randomUUID();
    const imageUrl = await this.resizeAndUpload(imageId, buffer);
    await this.db.insert(AnonymouseImageTable).values({
      id: imageId,
      usage: "shop",
      url: imageUrl,
      userId,
    });

    return {
      id: imageId,
      url: imageUrl,
    };
  }

  async anonymouseProductImages(
    userId: string,
    files: {
      thumbnailImage?: Buffer;
      images: Buffer[];
    },
  ) {
    const shop = await this.db.query.ShopTable.findFirst({
      where: eq(ShopTable.userId, userId),
    });
    if (!shop) {
      throw new KalamcheError(KalamcheErrorType.PermissionDenied);
    }

    const allFiles = [
      ...(files.thumbnailImage
        ? [{ file: files.thumbnailImage, isThumbnail: true }]
        : []),
      ...files.images.map((file) => ({ file, isThumbnail: false })),
    ];
    const uploaded = await Promise.all(
      allFiles.map(async ({ file, isThumbnail }) => {
        const imageId = randomUUID() as string;
        const url = await this.resizeAndUpload(imageId, file);
        return {
          id: imageId,
          usage: "product" as const,
          isThumbnail,
          url,
          userId,
        };
      }),
    );
    await this.db.transaction(async (tx) => {
      await tx.insert(AnonymouseImageTable).values(uploaded);
    });

    return uploaded;
  }

  private async resizeAndUpload(imageId: string, imageBuffer: Buffer) {
    try {
      const image = (await this.worker.run({
        imageBuffer,
        id: imageId,
      })) as ImageResize;

      return await this.s3Service.putObject(
        imageId,
        "image/webp",
        Buffer.from(image.buffer),
        true,
      );
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.ImageProcessingFailed, error);
    }
  }
}
