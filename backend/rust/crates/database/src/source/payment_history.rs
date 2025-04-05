use chrono::{DateTime, FixedOffset};
pub use entity::sea_orm_active_enums::PaymentStatus;
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct PaymentHistory {
  pub id: Uuid,
  pub fr_token_id: Uuid,
  pub user_id: Uuid,
  pub price: i64,
  pub fr_tokens: i32,
  pub status: PaymentStatus,
  pub transaction_id: String,
  pub session_id: String,
  pub created_at: DateTime<FixedOffset>,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaymentHistoryInsertForm {
  pub fr_token_id: Uuid,
  pub user_id: Uuid,
  pub price: i64,
  pub fr_tokens: i32,
  pub status: PaymentStatus,
  pub session_id: String,
}
