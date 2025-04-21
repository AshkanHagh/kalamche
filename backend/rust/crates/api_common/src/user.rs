use db_view::structs::UserView;
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
  #[serde(rename = "user")]
  pub my_user: MyUserInfo,
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
  #[serde(rename = "user")]
  pub my_user: MyUserInfo,
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

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
/// kalmche user info
pub struct MyUserInfo {
  #[serde(flatten)]
  pub user_view: UserView,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MyUserResponse {
  #[serde(rename = "user")]
  pub my_user: MyUserInfo,
  pub success: bool,
}
