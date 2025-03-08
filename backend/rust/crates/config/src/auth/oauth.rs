use async_trait::async_trait;

use crate::error::KalamcheResult;

pub struct OAuthUser {
  pub name: String,
  pub email: String,
  pub avatar_url: String,
}

#[async_trait]
pub trait OAuthStrategy {
  fn create_auth_url(&self) -> String;
  async fn authenticate(&self, code: String) -> KalamcheResult<OAuthUser>;
}
