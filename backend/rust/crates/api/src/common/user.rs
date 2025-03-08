use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct GetAuthUrlResponse {
  pub url: String,
}
