use db_schema::source::user::UserRecord;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
// Register / sign up to kalamche
pub struct Register {
  pub email: String,
  pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct Login {
  pub email: String,
  pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct VerifyEmail {
  pub code: u32,
  pub token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
  pub success: bool,
  pub access_token: String,
  pub user: UserRecord,
  pub verify_email_sent: bool,
}

#[derive(Debug, Deserialize)]
pub struct ResendVerificationEmail {
  pub email: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterResponse {
  pub success: bool,
  pub verification_token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VerifyEmailResponse {
  pub success: bool,
  pub access_token: String,
  pub user: UserRecord,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResendVerificationEmailResponse {
  pub success: bool,
  pub verification_token: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginPendingResponse {
  pub success: bool,
  pub verification_token: String,
  pub verify_email_sent: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RefreshTokenResponse {
  pub success: bool,
  pub access_token: String,
}
