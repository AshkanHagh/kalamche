use chrono::{DateTime, Utc};
use diesel::{
  prelude::{AsChangeset, Insertable, Queryable},
  Selectable,
};
use diesel_derive_enum::DbEnum;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::payment_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
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
  pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, DbEnum, Clone)]
#[ExistingTypePath = "crate::schema::sql_types::PaymentStatus"]
pub enum PaymentStatus {
  Pending,
  Completed,
  Faild,
}

#[derive(Debug, Deserialize, Serialize, Insertable)]
#[diesel(table_name = crate::schema::payment_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PaymentHistoryInsertForm {
  pub fr_token_id: Uuid,
  pub user_id: Uuid,
  pub price: i64,
  pub fr_tokens: i32,
  pub status: PaymentStatus,
  pub session_id: String,
  pub transaction_id: String,
}

#[derive(Debug, Deserialize, Serialize, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::payment_history)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PaymentHistoryUpdateForm {
  pub status: PaymentStatus,
  pub transaction_id: String,
}
