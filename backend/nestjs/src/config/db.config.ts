import { ConfigType, registerAs } from "@nestjs/config";
import { DB_CONFIG } from "./constants";
import { Inject } from "@nestjs/common";

export const dbConfig = registerAs(DB_CONFIG, () => {
  return {
    postgres: {
      url: process.env.DATABASE_URL!,
      ssl: false,
    },
    meilisearch: {
      host: process.env.MEILISEARCH_API_URL!,
      apiKey: process.env.MEILISEARCH_API_KEY!,
    },
  };
});

export const DbConfig = () => Inject(dbConfig.KEY);
export type IDbConfig = ConfigType<typeof dbConfig>;
