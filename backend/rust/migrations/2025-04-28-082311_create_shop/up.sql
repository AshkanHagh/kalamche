-- Your SQL goes here
CREATE TYPE shop_status AS ENUM ('active', 'pending', 'closed');

CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(300) NOT NULL,
  user_id UUID REFERENCES users NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMPTZ,
  phone VARCHAR(50) NOT NULL,
  website VARCHAR(100) NOT NULL,
  street_address VARCHAR(300) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code INTEGER NOT NULL,
  tax_id VARCHAR(100) NOT NULL,
  status shop_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now ()
);

-- user id is hard coded on user table migration
INSERT INTO shops (
  name,
  description,
  user_id,
  email,
  phone,
  website,
  street_address,
  city,
  state,
  zip_code,
  tax_id,
  status
)
VALUES
  (
    'Ashkan Shop 1',
    'First shop owned by Ashkan',
    '6fc84e13-6730-4121-b88c-cde616b46409',
    'shop1@ashkan.com',
    '123-456-7890',
    'https://ashkanshop1.com',
    '123 Main St',
    'Springfield',
    'IL',
    62701,
    'TAX123456',
    'pending'::shop_status
  ),
  (
    'Ashkan Shop 2',
    'Second shop owned by Ashkan',
    '6fc84e13-6730-4121-b88c-cde616b46409',
    'shop2@ashkan.com',
    '123-456-7891',
    'https://ashkanshop2.com',
    '456 Elm St',
    'Springfield',
    'IL',
    62702,
    'TAX789012',
    'pending'::shop_status
  ),
  (
    'Ashkan Shop 3',
    'Third shop owned by Ashkan',
    '6fc84e13-6730-4121-b88c-cde616b46409',
    'shop3@ashkan.com',
    '123-456-7892',
    'https://ashkanshop3.com',
    '789 Oak St',
    'Springfield',
    'IL',
    62703,
    'TAX345678',
    'pending'::shop_status
  );
