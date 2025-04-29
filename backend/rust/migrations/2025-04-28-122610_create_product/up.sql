-- Your SQL goes here

CREATE TYPE product_status AS ENUM ('draft', 'public');

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
  likes BIGINT NOT NULL DEFAULT 0,
  views BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

CREATE INDEX idx_shop_categories ON products USING GIN (categories);
