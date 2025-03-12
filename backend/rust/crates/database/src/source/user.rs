use chrono::{DateTime, FixedOffset};
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
  pub created_at: DateTime<FixedOffset>,
  pub updated_at: DateTime<FixedOffset>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserRecord {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub permissions: Vec<String>,
  pub created_at: DateTime<FixedOffset>,
}

#[derive(Debug)]
pub struct InsertUserForm {
  pub name: String,
  pub email: String,
  pub avatar_url: String,
}
