use async_trait::async_trait;
use uuid::Uuid;

use crate::error::KalamcheResult;

pub struct TokenClaims {
  pub sub: Uuid,
}

#[async_trait]
pub trait TokenStrategy {
  async fn sign(claims: TokenClaims) -> KalamcheResult<String>;
  async fn decode(token: String) -> KalamcheResult<TokenClaims>;
}
