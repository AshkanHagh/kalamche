-- Your SQL goes here
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(50) NOT NULL
);

INSERT INTO
  permissions (name)
VALUES
  ('user:read'),
  ('product:read'),
  ('store:read');
