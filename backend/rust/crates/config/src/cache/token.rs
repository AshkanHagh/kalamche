use async_trait::async_trait;
use uuid::Uuid;

use crate::error::KalamcheResult;

#[async_trait]
pub trait TokenCacheStrategy {
  async fn set(&self, token: String) -> KalamcheResult<()>;
  async fn get(&self, user_id: Uuid) -> KalamcheResult<Option<String>>;
  async fn delete(&self, user_id: Uuid) -> KalamcheResult<()>;
}
