-- Your SQL goes here
CREATE TYPE payment_status AS ENUM ('completed', 'pending', 'faild');

CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  fr_token_id UUID REFERENCES fr_token_plans NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  price BIGINT NOT NULL,
  fr_tokens INTEGER NOT NULL,
  status payment_status NOT NULL,
  transaction_id VARCHAR(100) NOT NULL,
  session_id VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);
