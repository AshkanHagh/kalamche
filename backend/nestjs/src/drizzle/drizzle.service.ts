import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Pool } from "pg";
import { DbConfig, IDbConfig } from "src/config/db.config";

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  public readonly pool: Pool;

  constructor(@DbConfig() dbConfig: IDbConfig) {
    this.pool = new Pool({
      connectionString: dbConfig.postgres.url,
      ssl: dbConfig.postgres.ssl,
      max: 20,
      min: 1,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
