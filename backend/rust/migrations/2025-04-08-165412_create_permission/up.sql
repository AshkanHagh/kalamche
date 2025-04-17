-- Your SQL goes here
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL
);

INSERT INTO
  permissions (name, resource, action)
VALUES
  ('product:create', 'product', 'create'),
  ('product:update', 'product', 'update'),
  ('product:delete', 'product', 'delete'),
  ('product:read', 'product', 'read'),
  ('user:create', 'user', 'create'),
  ('user:update', 'user', 'update'),
  ('user:delete', 'user', 'delete'),
  ('user:read', 'user', 'read'),
  ('shop:create', 'shop', 'create'),
  ('shop:update', 'shop', 'update'),
  ('shop:delete', 'shop', 'delete'),
  ('shop:read', 'shop', 'read');
