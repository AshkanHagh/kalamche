import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { resolve } from "node:path";
import { Pool } from "pg";
import { BrandTable } from "./schemas";

// TODO: add categories to setweight
export async function migration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const db = drizzle(pool, { casing: "snake_case" });

  const path = resolve(__dirname, "migrations");
  await migrate(db, { migrationsFolder: path });

  // create and add trigger auto update vector field in products table
  const query = sql`
    ALTER TABLE products ALTER COLUMN vector TYPE TSVECTOR USING vector::tsvector;

    CREATE OR REPLACE FUNCTION fn_extract_specification_text(spec JSONB[]) RETURNS TEXT AS $$
    DECLARE
      result TEXT := '';
      spec JSONB;
        BEGIN
          IF spec IS NULL THEN
            RETURN '';
          END IF;
          FOREACH spec IN ARRAY spec LOOP
            IF spec IS NOT NULL THEN
              result := result || ' ' || COALESCE(spec->>'value', '');
            END IF;
          END LOOP;
        END;
    $$ LANGUAGE plpgsql IMMUTABLE;

    CREATE OR REPLACE FUNCTION fn_update_search_vector() RETURNS TRIGGER AS $$
      DECLARE
        brand_name TEXT := '';
      BEGIN
        SELECT b.name INTO brand_name
        FROM ${BrandTable} b
        WHERE b.id = NEW.brand_id;

        NEW.vector :=
          setweight(to_tsvector('english', NEW.title), 'A') ||
          setweight(to_tsvector('english', NEW.description), 'B') ||
          setweight(to_tsvector('english', COALESCE(brand_name, '')), 'B') ||
          setweight(to_tsvector('english', fn_extract_specification_text(NEW.specifications)), 'D');
        RETURN NEW;
      END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER products_search_vector_update
      BEFORE INSERT OR UPDATE
        ON products
          FOR EACH ROW
          EXECUTE FUNCTION fn_update_search_vector();

    CREATE INDEX products_vector_idx ON products USING GIN(vector);
  `;

  await db.transaction(async (tx) => {
    await tx.execute(query);
  });
  await pool.end();
}

if (require.main === module) {
  (async () => {
    await migration();
    process.exit(0);
  })();
}
