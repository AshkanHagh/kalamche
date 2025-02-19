import * as z from "zod";

export default function envValidation() {
  return z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    JWT_ACCESS_SECRET: z.string(),
    JWT_REFRESH_SECRET: z.string(),
    JWT_ACCESS_EXPIRATION: z.string(),
    JWT_REFRESH_EXPIRATION: z.string(),
    MINIO_USER_NAME: z.string(),
    MINIO_PASSWORD: z.string(),
  });
}
