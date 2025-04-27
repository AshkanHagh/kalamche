-- Your SQL goes here
CREATE TYPE entity_type AS ENUM ('user', 'product');

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  hash VARCHAR(256),
  entity_id UUID NOT NULL,
  entity_type entity_type NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);
