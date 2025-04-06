use serde::Serialize;

pub mod context;
pub mod oauth_provider;
pub mod user;
pub mod utils;
pub mod wallet;

#[derive(Debug, Serialize)]
/// A response that completes successfully.
pub struct SuccessDefualt {
  pub success: bool,
}

impl Default for SuccessDefualt {
  fn default() -> Self {
    Self { success: true }
  }
}
