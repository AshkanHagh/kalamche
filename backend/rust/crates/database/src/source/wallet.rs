use chrono::{DateTime, FixedOffset};
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct Wallet {
  pub id: Uuid,
  pub user_id: Uuid,
  pub fr_tokens: i32,
  pub created_at: DateTime<FixedOffset>,
  pub updated_at: DateTime<FixedOffset>,
}
