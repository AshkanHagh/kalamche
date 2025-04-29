-- Your SQL goes here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

INSERT INTO
  users (id, name, email)
VALUES
  (
    '6fc84e13-6730-4121-b88c-cde616b46409',
    'John Doe',
    'john.doe@example.com'
  );
