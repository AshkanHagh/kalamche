use chrono::{DateTime, FixedOffset};
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, FromQueryResult)]
pub struct PendingUser {
  pub id: Uuid,
  pub email: String,
  pub password_hash: Option<String>,
  pub token: String,
  pub created_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PendingUserInsertForm {
  pub email: String,
  pub password_hash: Option<String>,
  pub token: String,
}
