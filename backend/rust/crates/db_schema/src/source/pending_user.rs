use chrono::{DateTime, Utc};
use diesel::{
  prelude::{Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::pending_users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct PendingUser {
  pub id: Uuid,
  pub email: String,
  pub password_hash: Option<String>,
  pub token: String,
  pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, Serialize, Insertable)]
#[diesel(table_name = crate::schema::pending_users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct PendingUserInsertForm {
  pub email: String,
  pub password_hash: Option<String>,
  pub token: String,
}
