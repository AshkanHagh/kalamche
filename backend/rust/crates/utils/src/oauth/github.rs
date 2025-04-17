use serde::{Deserialize, Serialize};

use super::oauth_client::OAuthUser;
use crate::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

#[derive(Deserialize)]
pub struct GithubUserRes {
  pub name: String,
  pub id: u64,
  pub avatar_url: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GithubUserEmail {
  pub email: String,
  pub primary: bool,
  pub verified: bool,
  pub visibility: Option<String>,
}

pub(super) fn map_github_user(
  info_value: serde_json::Value,
  others_info_value: Option<serde_json::Value>,
) -> KalamcheResult<OAuthUser> {
  let user_info = serde_json::from_value::<GithubUserRes>(info_value)
    .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?;

  let user_emails = serde_json::from_value::<Vec<GithubUserEmail>>(others_info_value.unwrap())
    .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?;

  let user_primary_email = user_emails
    .into_iter()
    .find(|email| email.primary && email.verified)
    .ok_or(KalamcheErrorType::EmailRequired)?;

  Ok(OAuthUser {
    id: user_info.id.to_string(),
    name: user_info.name,
    email: user_primary_email.email,
    avatar_url: user_info.avatar_url,
  })
}
