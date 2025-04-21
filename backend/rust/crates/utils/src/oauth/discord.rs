use serde::Deserialize;

use super::oauth_client::OAuthUser;
use crate::error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult};

#[derive(Deserialize)]
struct DiscordUserRes {
  pub id: String,
  pub username: String,
  pub email: Option<String>,
  pub avatar: Option<String>,
}

pub(super) fn map_discord_user(info_value: serde_json::Value) -> KalamcheResult<OAuthUser> {
  let user_info = serde_json::from_value::<DiscordUserRes>(info_value)
    .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?;

  let user_avatar = user_info
    .avatar
    .map(|avatar| {
      format!(
        "https://cdn.discordapp.com/avatars/{}/{}.png",
        user_info.id, avatar
      )
    })
    .unwrap_or("#".to_string());

  Ok(OAuthUser {
    id: user_info.id.clone(),
    name: user_info.username,
    email: user_info.email.ok_or(KalamcheErrorType::EmailRequired)?,
    avatar_url: user_avatar,
  })
}
