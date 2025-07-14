import { ConfigType, registerAs } from "@nestjs/config";
import { S3_CONFIG } from "./constants";
import { Inject } from "@nestjs/common";

export const s3Config = registerAs(S3_CONFIG, () => {
  return {
    accessKey: process.env.AWS_S3_ACCESS_KEY,
    secretKey: process.env.AWS_S3_SECRET_KEY,
    bucketName: process.env.AWS_S3_BUCKET_NAME,
    endpoint: process.env.AWS_S3_ENDPOINT,
    region: process.env.AWS_S3_REGION,
    usePathStyle: process.env.AWS_S3_USE_PATH_STYLE === "true",
  };
});

export const S3Config = () => Inject(s3Config.KEY);
export type IS3Config = ConfigType<typeof s3Config>;
