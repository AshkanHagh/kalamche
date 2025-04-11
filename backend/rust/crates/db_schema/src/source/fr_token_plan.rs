use chrono::{DateTime, Utc};
use diesel::{prelude::Queryable, Selectable};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::fr_token_plans)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct FrTokenPlan {
  pub id: Uuid,
  pub name: String,
  pub description: String,
  pub fr_tokens: i32,
  pub price: i64,
  pub price_per_fr_token: i16,
  pub created_at: DateTime<Utc>,
}
