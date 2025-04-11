-- Your SQL goes here
CREATE TABLE login_tokens (
  user_id UUID REFERENCES users ON DELETE CASCADE PRIMARY KEY,
  token_hash VARCHAR(300) NOT NULL,
  ip VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);
