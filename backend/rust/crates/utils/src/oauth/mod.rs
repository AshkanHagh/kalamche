use oauth_client::{OAuthClient, OAuthUser};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::{
  error::{KalamcheErrorType, KalamcheResult},
  settings::structs::OAuthConfig,
};

pub mod discord;
pub mod github;
pub mod oauth_client;

#[derive(Debug, Serialize, Deserialize, Hash, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum OAuthProvider {
  Github,
  Discord,
}

pub struct OAuthManager {
  pub clients: HashMap<OAuthProvider, OAuthClient>,
}

impl OAuthManager {
  pub fn new(config: &OAuthConfig, client: Client) -> KalamcheResult<Self> {
    let mut clients: HashMap<OAuthProvider, OAuthClient> = HashMap::new();

    let github = config
      .github
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?;

    let discord = config
      .discord
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?;

    let github_provider = OAuthClient::new(github, client.clone())?;
    let discord_provider = OAuthClient::new(discord, client)?;
    clients.insert(OAuthProvider::Github, github_provider);
    clients.insert(OAuthProvider::Discord, discord_provider);

    Ok(Self { clients })
  }

  pub fn get_authorize_url(&self, provider: &OAuthProvider) -> KalamcheResult<String> {
    let scopes = match provider {
      OAuthProvider::Github => vec!["user:read", "user:email"],
      OAuthProvider::Discord => vec!["email", "identify"],
    };

    let url = self
      .clients
      .get(provider)
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?
      .get_authorize_url(scopes);

    Ok(url)
  }

  pub async fn authenticate(
    &self,
    provider: &OAuthProvider,
    code: String,
  ) -> KalamcheResult<OAuthUser> {
    self
      .clients
      .get(provider)
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?
      .authenticate(provider, code)
      .await
  }
}
