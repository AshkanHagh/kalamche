import { MinioContainer, StartedMinioContainer } from "@testcontainers/minio";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { migration } from "../src/drizzle/migration";

export class TestContainers {
  private static instance: TestContainers;
  public minioContainer: StartedMinioContainer;
  public pgContainer: StartedPostgreSqlContainer;
  private isSetup = false;

  constructor() {}

  static getInstance() {
    if (!TestContainers.instance) {
      TestContainers.instance = new TestContainers();
    }

    return TestContainers.instance;
  }

  async setup() {
    if (!this.isSetup) {
      await this.#startContainers();
      this.isSetup = true;
    }
  }

  async #startContainers() {
    if (!this.pgContainer) {
      this.pgContainer = await new PostgreSqlContainer(
        "registry.docker.ir/pgvector/pgvector:0.8.0-pg17",
      ).start();
      process.env.DATABASE_URL = this.pgContainer.getConnectionUri();

      await migration();
    }

    if (!this.minioContainer) {
      this.minioContainer = await new MinioContainer(
        "registry.docker.ir/minio/minio:latest",
      ).start();

      process.env.AWS_S3_ACCESS_KEY = "minioadmin";
      process.env.AWS_S3_SECRET_KEY = "minioadmin";
      process.env.AWS_S3_BUCKET_NAME = "kalamche";
      process.env.AWS_S3_ENDPOINT = `http://${this.minioContainer.getHost()}:${this.minioContainer.getPort()}`;
      process.env.AWS_S3_REGION = " ";
      process.env.AWS_S3_USE_PATH_STYLE = "true";
    }
  }

  async teardown() {
    if (this.pgContainer) {
      await this.pgContainer.stop();
    }
    if (this.minioContainer) {
      await this.minioContainer.stop();
    }
  }
}
