use oauth2::{
  basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
  ClientSecret, CsrfToken, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::{
  error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  settings::structs::OAuthProviderConfig,
};

pub struct OAuthClient {
  pub name: String,
  pub client: BasicClient,
  pub reqwest: Client,
  pub user_info_url: String,
  pub other_info_url: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct OAuthUser {
  pub id: String,
  pub name: String,
  pub email: String,
  pub avatar_url: String,
}

impl OAuthClient {
  pub fn new(config: &OAuthProviderConfig, name: &str, reqwest: Client) -> KalamcheResult<Self> {
    let client = BasicClient::new(
      ClientId::new(config.client_id.to_owned()),
      Some(ClientSecret::new(config.client_secret.to_owned())),
      AuthUrl::new(config.auth_url.to_owned())?,
      Some(TokenUrl::new(config.token_url.to_owned())?),
    )
    .set_redirect_uri(RedirectUrl::new(config.redirect_url.to_owned())?);

    Ok(Self {
      name: name.to_owned(),
      client,
      reqwest,
      user_info_url: config.user_info_url.to_owned(),
      other_info_url: config.other_info_url.to_owned(),
    })
  }

  pub fn get_authorize_url(&self, scopes: Vec<&str>) -> String {
    let (url, _csrf_token) = self
      .client
      .authorize_url(|| CsrfToken::new_random())
      .add_scopes(scopes.into_iter().map(|scope| Scope::new(scope.to_owned())))
      .url();

    return url.to_string();
  }

  pub async fn authenticate(&self, code: String) -> KalamcheResult<OAuthUser> {
    let token_result = self
      .client
      .exchange_code(AuthorizationCode::new(code))
      .request_async(async_http_client)
      .await?;

    let access_token = token_result.access_token().secret();
    let user = self.get_user_info(access_token).await?;

    Ok(user)
  }

  async fn get_user_info(&self, access_token: &str) -> KalamcheResult<OAuthUser> {
    let user_info = self
      .reqwest
      .get(&self.user_info_url)
      .header("User-Agent", "ashkanHagh/kalamche")
      .bearer_auth(access_token)
      .send()
      .await
      .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?
      .json::<serde_json::Value>()
      .await
      .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?;

    let other_info = match &self.other_info_url {
      Some(url) => {
        let info = self
          .reqwest
          .get(url)
          .header("User-Agent", "ashkanHagh/kalamche")
          .bearer_auth(access_token)
          .send()
          .await
          .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?
          .json::<serde_json::Value>()
          .await
          .with_kalamche_type(KalamcheErrorType::OAuthLoginFailed)?;

        Some(info)
      }
      None => None,
    };

    // use enum
    match self.name.as_str() {
      "github" => self.map_github_user(user_info, other_info),
      "discord" => self.map_discord_user(user_info),
      _ => Err(KalamcheError::from(
        KalamcheErrorType::OAuthAuthorizationInvalid,
      )),
    }
  }

  fn map_github_user(
    &self,
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

  fn map_discord_user(&self, info_value: serde_json::Value) -> KalamcheResult<OAuthUser> {
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
}

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

#[derive(Deserialize)]
struct DiscordUserRes {
  pub id: String,
  pub username: String,
  pub email: Option<String>,
  pub avatar: Option<String>,
}
