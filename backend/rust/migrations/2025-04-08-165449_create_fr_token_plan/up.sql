-- Your SQL goes here
CREATE TABLE fr_token_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(255) NOT NULL,
  description VARCHAR(500) NOT NULL,
  fr_tokens INTEGER NOT NULL,
  price BIGINT NOT NULL,
  price_per_fr_token SMALLINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

INSERT INTO
  fr_token_plans (
    name,
    description,
    fr_tokens,
    price,
    price_per_fr_token
  )
VALUES
  (
    'Starter Pack',
    'Perfect for small businesses or beginners testing the waters. Get 300 clicks to promote your products and see results without breaking the bank.',
    300,
    1500,
    5
  ),
  (
    'Growth Pack',
    'Scale up your reach with 1000 clicks. Ideal for growing businesses looking to boost product visibility and drive steady traffic.',
    1000,
    4500,
    4
  ),
  (
    'Pro Pack',
    'Dominate the market with 5000 clicks. Designed for high-volume advertisers who want maximum exposure at the best value per click.',
    5000,
    20000,
    4
  );
