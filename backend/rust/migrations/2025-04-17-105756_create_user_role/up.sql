-- Your SQL goes here
CREATE TABLE user_roles (
  user_id UUID REFERENCES users NOT NULL,
  role_id UUID REFERENCES roles NOT NULL,
  PRIMARY KEY (user_id, role_id)
);
