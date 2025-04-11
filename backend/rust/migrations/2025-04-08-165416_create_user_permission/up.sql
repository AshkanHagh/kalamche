-- Your SQL goes here
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  user_id UUID REFERENCES users ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions ON DELETE CASCADE NOT NULL
);
