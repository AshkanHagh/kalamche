use serde::{Deserialize, Serialize};
use utils::oauth::OAuthProvider;

use crate::user::MyUserInfo;

#[derive(Debug, Deserialize)]
pub struct GetAuthorizeUrl {
  pub provider: OAuthProvider,
}

#[derive(Debug, Deserialize)]
pub struct AuthenticateWithOAuth {
  pub provider: OAuthProvider,
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
  #[serde(rename = "user")]
  pub my_user: MyUserInfo,
}
