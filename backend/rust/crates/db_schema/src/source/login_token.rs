use chrono::{DateTime, Utc};
use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// stores data related to a specific user login session.
#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::login_tokens)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct LoginToken {
  pub user_id: Uuid,
  pub token_hash: String,
  pub ip: String,
  // time of login
  pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize, Insertable)]
#[diesel(table_name = crate::schema::login_tokens)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct LoginTokenInsertForm {
  pub user_id: Uuid,
  pub token_hash: String,
  pub ip: String,
}
