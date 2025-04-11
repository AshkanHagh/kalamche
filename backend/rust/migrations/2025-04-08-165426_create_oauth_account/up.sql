-- Your SQL goes here
CREATE TABLE oauth_accounts (
  oauth_user_id VARCHAR(50) PRIMARY KEY,
  user_id UUID REFERENCES users ON DELETE CASCADE NOT NULL
);
