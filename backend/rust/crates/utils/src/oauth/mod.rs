use oauth_client::{OAuthClient, OAuthUser};
use reqwest::Client;
use std::collections::HashMap;

use crate::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::structs::OAuthConfig,
};

pub mod oauth_client;

pub struct OAuthManager {
  pub clients: HashMap<String, OAuthClient>,
}

impl OAuthManager {
  pub fn new(config: &OAuthConfig, client: Client) -> KalamcheResult<Self> {
    let mut clients: HashMap<String, OAuthClient> = HashMap::new();

    let github = config
      .github
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?;

    let discord = config
      .discord
      .as_ref()
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?;

    let github_provider = OAuthClient::new(github, "github", client.clone())?;
    let discord_provider = OAuthClient::new(discord, "discord", client)?;
    clients.insert(github_provider.name.to_owned(), github_provider);
    clients.insert(discord_provider.name.to_owned(), discord_provider);

    Ok(Self { clients })
  }

  pub fn get_authorize_url(&self, provider: &str) -> KalamcheResult<String> {
    let scopes = match provider {
      "github" => vec!["user:read", "user:email"],
      "discord" => vec!["email", "identify"],
      _ => {
        return Err(KalamcheError::from(
          KalamcheErrorType::OAuthRegistrationClosed,
        ))
      }
    };

    let url = self
      .clients
      .get(provider)
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?
      .get_authorize_url(scopes);

    Ok(url)
  }

  pub async fn authenticate(&self, provider: &str, code: String) -> KalamcheResult<OAuthUser> {
    self
      .clients
      .get(provider)
      .ok_or(KalamcheErrorType::OAuthRegistrationClosed)?
      .authenticate(code)
      .await
  }
}
