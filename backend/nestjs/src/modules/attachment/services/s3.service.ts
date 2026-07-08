import {
  DeleteObjectCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  PutObjectTaggingCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { OnModuleInit } from "@nestjs/common";
import { IS3Config, S3Config } from "src/config/s3.config";
import { KalamcheError, KalamcheErrorType } from "src/filters/exception";

export class S3Service implements OnModuleInit {
  private client: S3Client;

  constructor(@S3Config() private config: IS3Config) {
    this.client = new S3Client({
      endpoint: this.config.endpoint,
      credentials: {
        accessKeyId: this.config.accessKey!,
        secretAccessKey: this.config.secretKey!,
      },
      forcePathStyle: this.config.usePathStyle,
      region: this.config.region!,
    });
  }

  async onModuleInit() {
    const ruleId = "expire-temp-objects-after-1-day";
    try {
      const rules = await this.client.send(
        new GetBucketLifecycleConfigurationCommand({
          Bucket: this.config.bucketName,
        }),
      );
      if (rules.Rules?.find((rule) => rule.ID == ruleId)) {
        return;
      }
    } catch (_) {}

    await this.client
      .send(
        new PutBucketLifecycleConfigurationCommand({
          Bucket: this.config.bucketName,
          LifecycleConfiguration: {
            Rules: [
              {
                ID: "expire-temp-objects-after-1-day",
                Status: "Enabled",
                Filter: {
                  Tag: {
                    Key: "temp",
                    Value: "true",
                  },
                },
                Expiration: {
                  Days: 1,
                },
              },
            ],
          },
        }),
      )
      .catch(() => {});
  }

  async putObject(
    id: string,
    mimeType: string,
    buffer: Buffer,
    temp: boolean = true,
  ) {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucketName,
          Key: id,
          Body: buffer,
          ContentType: mimeType,
          Tagging: temp ? "temp=true" : "temp=false",
        }),
      );
      const url = `${this.config.endpoint}/${this.config.bucketName}/${id}`;
      return url;
    } catch (error: unknown) {
      throw new KalamcheError(KalamcheErrorType.S3ReqFailed, error);
    }
  }

  async delete(id: string) {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.config.bucketName,
          Key: id,
        }),
      );
    } catch (error: unknown) {
      throw new KalamcheError(KalamcheErrorType.S3ReqFailed, error);
    }
  }

  async removeImageTempFlag(fileId: string) {
    try {
      await this.client.send(
        new PutObjectTaggingCommand({
          Bucket: this.config.bucketName,
          Key: fileId,
          Tagging: {
            TagSet: [],
          },
        }),
      );
    } catch (error) {
      throw new KalamcheError(KalamcheErrorType.S3ReqFailed, error);
    }
  }
}
