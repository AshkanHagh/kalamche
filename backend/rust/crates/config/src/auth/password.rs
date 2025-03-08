use async_trait::async_trait;

use crate::error::KalamcheResult;

#[async_trait]
pub trait PasswordHashStrategy {
  async fn hash(&self, plain_text: String) -> KalamcheResult<String>;
  async fn verify(&self, plain_text: String, hash: String) -> KalamcheResult<bool>;
}
