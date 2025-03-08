use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CreateAuthUrlResponse {
  pub url: String,
}
