use chrono::{DateTime, Utc};
use diesel::{
  prelude::{AsChangeset, Insertable, Queryable},
  Selectable,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Queryable, Selectable)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
#[serde(rename_all = "camelCase")]
pub struct User {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub password_hash: Option<String>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Insertable, AsChangeset)]
#[diesel(table_name = crate::schema::users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct UserInsertForm {
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub password_hash: Option<String>,
}
