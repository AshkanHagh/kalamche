use oauth2::{basic::BasicClient, AuthUrl, ClientId, ClientSecret, CsrfToken, Scope, TokenUrl};
use reqwest::Client;
use serde::{Deserialize, Serialize};

use crate::{
  error::{KalamcheErrorType, KalamcheResult},
  setting::structs::OAuthConfig,
};

#[derive(Debug, Deserialize, Serialize)]
pub struct GithubOAuthUser {
  pub name: String,
  pub email: String,
  pub avatar_url: String,
}

pub struct GithubOAuth {
  client: BasicClient,
  reqwest: Client,
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

  pub async fn authenticate(&self, code: String) -> KalamcheResult<GithubOAuthUser> {
    todo!()
  }
}
