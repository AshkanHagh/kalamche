import { SearchService } from "../../modules/product/search/search.service";
import { Database } from "../types";

export async function indexProductsToSearch(db: Database) {
  const products = await db.query.ProductTable.findMany({
    columns: {
      id: true,
    },
  });
  const meilisearchService = new SearchService(
    {
      postgres: {
        url: process.env.DATABASE_URL!,
        ssl: false,
      },
      meilisearch: {
        host: process.env.MEILISEARCH_API_URL!,
        apiKey: process.env.MEILISEARCH_API_KEY!,
      },
    },
    db,
  );
  await meilisearchService.onModuleInit();
  await Promise.all(
    products.map(
      async (product) => await meilisearchService.indexProduct(product.id),
    ),
  );
}
