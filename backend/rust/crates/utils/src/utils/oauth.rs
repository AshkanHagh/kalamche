use oauth2::{
  basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
  ClientSecret, CsrfToken, Scope, TokenResponse, TokenUrl,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::{
  error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  setting::structs::OAuthConfig,
};

pub struct GithubOAuth {
  client: BasicClient,
  reqwest: Client,
}

// Main oauth struct
#[derive(Debug, Deserialize, Serialize)]
pub struct OAuthUser {
  pub name: String,
  pub email: String,
  pub avatar_url: String,
}

#[derive(Deserialize)]
pub struct GithubUserRes {
  pub name: Option<String>,
  pub email: Option<String>,
  pub avatar_url: String,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct GithubUserEmail {
  pub email: String,
  pub primary: bool,
  pub verified: bool,
  pub visibility: Option<String>,
}

impl GithubOAuth {
  pub fn new(config: &Option<OAuthConfig>, reqwest: Client) -> KalamcheResult<Self> {
    let auth_url = "https://github.com/login/oauth/authorize".to_string();
    let token_url = "https://github.com/login/oauth/access_token".to_string();

    let config = config
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthNotConfigured)?;

    let client = BasicClient::new(
      ClientId::new(config.client_id.to_owned()),
      Some(ClientSecret::new(config.client_secret.to_owned())),
      AuthUrl::new(auth_url)?,
      Some(TokenUrl::new(token_url)?),
    );

    Ok(Self { client, reqwest })
  }

  pub fn create_auth_url(&self) -> String {
    let (url, _csrf_token) = self
      .client
      .authorize_url(|| CsrfToken::new_random())
      .add_scopes(vec![
        Scope::new("read:user".to_string()),
        Scope::new("user:email".to_string()),
      ])
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
    let (user_req, user_email_req) = tokio::join!(
      self
        .reqwest
        .get("https://api.github.com/user")
        .header("User-Agent", "ashkanHagh/kalamche")
        .bearer_auth(access_token)
        .send(),
      self
        .reqwest
        .get("https://api.github.com/user/emails")
        .header("User-Agent", "ashkanHagh/kalamche")
        .bearer_auth(access_token)
        .send()
    );

    let user = user_req
      .with_kalamche_type(KalamcheErrorType::InvalidOAuthAuthorization)?
      .json::<GithubUserRes>()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidFieldInRequestBody)?;

    let user_emails = user_email_req
      .with_kalamche_type(KalamcheErrorType::InvalidOAuthAuthorization)?
      .json::<Vec<GithubUserEmail>>()
      .await
      .with_kalamche_type(KalamcheErrorType::InvalidFieldInRequestBody)?;

    let user_primary_email = user_emails
      .iter()
      .find(|emails| emails.primary && emails.verified)
      .cloned()
      .ok_or(KalamcheErrorType::OAuthNoVerifiedPrimaryEmail)?;

    Ok(OAuthUser {
      name: user.name.unwrap_or_default(),
      email: user_primary_email.email,
      avatar_url: user.avatar_url,
    })
  }
}
