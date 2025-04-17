-- Your SQL goes here
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(50) NOT NULL,
  description VARCHAR(255) NOT NULL
);

INSERT INTO
  Roles (name, description)
VALUES
  ('admin', 'todo'),
  ('user', 'todo');
