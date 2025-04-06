use db_schema::source::user::UserRecord;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct GetAuthorizeUrl {
  pub provider: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthenticateWithOAuth {
  pub provider: String,
  pub state: String,
  pub code: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GetAuthrizeUrlResponse {
  pub success: bool,
  pub url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthenticateWithOAuthResponse {
  pub success: bool,
  pub access_token: String,
  pub user: UserRecord,
}
