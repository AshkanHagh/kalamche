import { ConfigService } from "@nestjs/config";
import { ImageProvider, ImageResource } from "./image.provider";
import * as AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import { CatchError } from "src/common/utils/error";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MinioProvider implements ImageProvider {
  private s3: AWS.S3;
  private bucketName = "kalamche";

  constructor(private readonly config: ConfigService) {
    this.s3 = new AWS.S3({
      endpoint: "localhost:9000",
      accessKeyId: this.config.get<string>("MINIO_USER_NAME"),
      secretAccessKey: this.config.get<string>("MINIO_PASSWORD"),
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    });
  }

  async upload(file: Express.Multer.File): Promise<ImageResource> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: uuid(),
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const result = await this.s3.upload(params).promise();

      return {
        url: result.Location,
        id: result.Key,
      };
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.s3
        .deleteObject({
          Bucket: this.bucketName,
          Key: id,
        })
        .promise();
    } catch (error: unknown) {
      throw CatchError(error);
    }
  }
}
