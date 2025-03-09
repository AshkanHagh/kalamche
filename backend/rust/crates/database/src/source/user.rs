use chrono::NaiveDateTime;
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct User {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub refresh_token_hash: Option<String>,
  pub last_login: Option<NaiveDateTime>,
  pub created_at: NaiveDateTime,
  pub updated_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserRecord {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub permissions: Vec<String>,
  pub created_at: NaiveDateTime,
}
