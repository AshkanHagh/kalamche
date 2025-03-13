use sea_orm::FromQueryResult;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromQueryResult)]
#[serde(rename_all = "camelCase")]
pub struct OAuthAccount {
  pub oauth_user_id: String,
  pub user_id: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthAccountInsertForm {
  pub oauth_user_id: String,
  pub user_id: Uuid,
}
