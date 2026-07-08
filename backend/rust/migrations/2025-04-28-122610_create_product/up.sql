-- Your SQL goes here

CREATE TYPE product_status AS ENUM ('draft', 'published');

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  shop_id UUID REFERENCES shops NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  status product_status NOT NULL DEFAULT 'draft',
  categories TEXT[] NOT NULL,
  specifications JSONB[] NOT NULL,
  website TEXT NOT NULL,
  search_vector TSVECTOR NOT NULL,
  likes BIGINT NOT NULL DEFAULT 0,
  views BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE OR REPLACE FUNCTION extract_specification_text(spec JSONB[]) RETURNS TEXT AS $$
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
    RETURN trim(result);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', NEW.name), 'A') ||
        setweight(to_tsvector('english', NEW.description), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.categories, ' ')), 'C') ||
        setweight(to_tsvector('english', extract_specification_text(NEW.specifications)), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_search_vector_update
    BEFORE INSERT OR UPDATE
    ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_search_vector();

CREATE INDEX products_search_vector_idx ON products USING GIN(search_vector);
