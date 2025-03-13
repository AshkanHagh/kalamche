use chrono::{DateTime, FixedOffset};
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, FromQueryResult)]
pub struct PendingUser {
  pub id: Uuid,
  pub email: String,
  pub password_hash: String,
  pub token: String,
  pub published: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PendingUserInsertForm {
  pub id: Uuid,
  pub email: String,
  pub password_hash: String,
  pub token: String,
}
