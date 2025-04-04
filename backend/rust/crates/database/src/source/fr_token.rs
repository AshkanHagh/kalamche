use chrono::{DateTime, FixedOffset};
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Deserialize, Serialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct FrTokenPlan {
  pub id: Uuid,
  pub name: String,
  pub description: String,
  pub fr_tokens: i32,
  pub price: i64,
  pub price_per_fr_token: i16,
  pub created_at: DateTime<FixedOffset>,
}
