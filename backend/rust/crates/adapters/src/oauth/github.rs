use async_trait::async_trait;
use config::{
  auth::oauth::{OAuthStrategy, OAuthUser},
  error::KalamcheResult,
  setting::structs::Settings,
};
use oauth2::{basic::BasicClient, AuthUrl, ClientId, ClientSecret, CsrfToken, Scope, TokenUrl};
use reqwest::Client;

pub struct GithubOAuth {
  client: BasicClient,
  reqwest: Client,
}

impl GithubOAuth {
  pub fn new(setting: &Settings, reqwest: Client) -> KalamcheResult<Self> {
    let auth_url = "https://github.com/login/oauth/authorize".to_string();
    let token_url = "https://github.com/login/oauth/access_token".to_string();

    let client = BasicClient::new(
      ClientId::new(setting.oauth.client_id.clone()),
      Some(ClientSecret::new(setting.oauth.client_secret.clone())),
      AuthUrl::new(auth_url)?,
      Some(TokenUrl::new(token_url)?),
    );

    Ok(Self { client, reqwest })
  }
}

#[async_trait]
impl OAuthStrategy for GithubOAuth {
  fn create_auth_url(&self) -> String {
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

  async fn authenticate(&self, code: String) -> KalamcheResult<OAuthUser> {
    todo!()
  }
}
