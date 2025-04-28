-- Your SQL goes here
CREATE TABLE shop_rates (
  shop_id UUID REFERENCES shops NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  rate FLOAT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  PRIMARY KEY (shop_id, user_id)
);
