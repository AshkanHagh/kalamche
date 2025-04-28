-- Your SQL goes here
CREATE TYPE shop_status AS ENUM ('active', 'pending', 'closed');

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(300) NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMPTZ,
  phone VARCHAR(50) NOT NULL,
  website VARCHAR(100) NOT NULL,
  street_address VARCHAR(300) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code INTEGER NOT NULL,
  tax_id VARCHAR(100) NOT NULL,
  status shop_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);
