use reqwest::Client;
use serde::Deserialize;
use std::collections::HashMap;
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  oauth::{OAuthClient, OAuthUser},
  settings::structs::OAuthConfig,
};

pub struct OAuthManager {
  pub clients: HashMap<String, OAuthClient>,
}

impl OAuthManager {
  pub fn new(config: &OAuthConfig, client: Client) -> KalamcheResult<Self> {
    let mut clients: HashMap<String, OAuthClient> = HashMap::new();

    let github = config
      .github
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthNotConfigured)?;

    let github_provider = OAuthClient::new(github, "github", client)?;
    clients.insert(github_provider.name.to_owned(), github_provider);

    Ok(Self { clients })
  }

  pub fn get_authorize_url(&self, provider: &str) -> KalamcheResult<String> {
    let url = match provider {
      "github" => self
        .clients
        .get("github")
        .ok_or(KalamcheErrorType::OAuthNotConfigured)?
        .get_authorize_url(vec!["user:read", "user:email"]),
      _ => return Err(KalamcheError::from(KalamcheErrorType::OAuthNotConfigured)),
    };

    Ok(url)
  }

  pub async fn authenticate(&self, provider: &str, code: String) -> KalamcheResult<OAuthUser> {
    self
      .clients
      .get(provider)
      .ok_or(KalamcheErrorType::OAuthNotConfigured)?
      .authenticate(code)
      .await
  }
}

#[derive(Debug, Deserialize)]
pub struct GetAuthorizeUrl {
  pub provider: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthenticateWithOAuth {
  pub provider: String,
  pub state: String,
  pub code: String,
}
