use serde::Deserialize;

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
