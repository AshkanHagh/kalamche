-- Your SQL goes here
CREATE TABLE pending_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(300),
  token VARCHAR(300) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);
