use async_trait::async_trait;

use crate::error::KalamcheResult;

#[async_trait]
pub trait CacheStrategy<T> {
  async fn set(&self, key: &str, value: T) -> KalamcheResult<()>;
  async fn get(&self, key: &str) -> KalamcheResult<Option<String>>;
  async fn delete(&self, key: &str) -> KalamcheResult<()>;
}
