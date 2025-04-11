use chrono::{DateTime, Utc};
use diesel::{
  prelude::{AsChangeset, Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::wallets)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct Wallet {
  pub id: Uuid,
  pub user_id: Uuid,
  pub fr_tokens: i32,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize, Insertable)]
#[diesel(table_name = crate::schema::wallets)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct WalletInsertForm {
  pub user_id: Uuid,
  pub fr_tokens: i32,
}

#[derive(Debug, Serialize, Deserialize, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::wallets)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct WalletUpdateForm {
  pub fr_tokens: i32,
}
