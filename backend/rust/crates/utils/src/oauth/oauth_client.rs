use oauth2::{
  basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
  ClientSecret, CsrfToken, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::{
  error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  settings::structs::OAuthProviderConfig,
};

use super::{discord::map_discord_user, github::map_github_user, OAuthProvider};

pub struct OAuthClient {
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
  pub fn new(config: &OAuthProviderConfig, reqwest: Client) -> KalamcheResult<Self> {
    let client = BasicClient::new(
      ClientId::new(config.client_id.to_owned()),
      Some(ClientSecret::new(config.client_secret.to_owned())),
      AuthUrl::new(config.auth_url.to_owned())?,
      Some(TokenUrl::new(config.token_url.to_owned())?),
    )
    .set_redirect_uri(RedirectUrl::new(config.redirect_url.to_owned())?);

    Ok(Self {
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

  pub async fn authenticate(
    &self,
    provider: &OAuthProvider,
    code: String,
  ) -> KalamcheResult<OAuthUser> {
    let token_result = self
      .client
      .exchange_code(AuthorizationCode::new(code))
      .request_async(async_http_client)
      .await?;

    let access_token = token_result.access_token().secret();
    let user = self.get_user_info(provider, access_token).await?;

    Ok(user)
  }

  async fn get_user_info(
    &self,
    provider: &OAuthProvider,
    access_token: &str,
  ) -> KalamcheResult<OAuthUser> {
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

    match provider {
      OAuthProvider::Github => map_github_user(user_info, other_info),
      OAuthProvider::Discord => map_discord_user(user_info),
    }
  }
}
