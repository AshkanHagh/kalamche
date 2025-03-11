use chrono::NaiveDateTime;
use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

// stores data related to a specific user login session.
#[derive(Debug, Deserialize, Serialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct LoginToken {
  pub user_id: Uuid,
  pub token_hash: String,
  // time of login
  pub published: NaiveDateTime,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct LoginTokenForm {
  pub user_id: Uuid,
  pub token_hash: String,
}
