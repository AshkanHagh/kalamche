use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
pub struct GetAuthUrlResponse {
  pub url: String,
}

#[derive(Debug, Deserialize)]
pub struct AuthenticateWithOAuth {
  pub code: String,

  #[serde(flatten)]
  pub extra: HashMap<String, String>,
}
