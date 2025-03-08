use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub refresh_token_hash: Option<String>,
  pub last_login: DateTime<Utc>,
  pub created_at: DateTime<Utc>,
  pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserRecord {
  pub id: Uuid,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
  pub permissions: Vec<String>,
  pub created_at: DateTime<Utc>,
}
