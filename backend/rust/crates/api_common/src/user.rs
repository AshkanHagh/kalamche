use database::source::user::UserRecord;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct Register {
  pub email: String,
  pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmailRegistration {
  pub code: String,
  pub token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
  pub success: bool,
  pub verification_token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
  pub success: bool,
  pub access_token: String,
  pub user: UserRecord,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthrizeUrlResponse {
  pub success: bool,
  pub url: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshTokenResponse {
  pub success: bool,
  pub access_token: String,
}
