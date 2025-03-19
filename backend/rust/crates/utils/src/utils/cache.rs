use redis::{aio::MultiplexedConnection, AsyncCommands};
use serde::Serialize;
use std::ops::Deref;

use crate::{
  error::{KalamcheErrorType, KalamcheResult},
  setting::structs::RedisConfig,
};

const DEFAULT_CACHE_TTL: usize = 60 * 60;

#[derive(Debug, Clone)]
pub struct RedisCache(pub MultiplexedConnection);

impl RedisCache {
  pub async fn new(config: &Option<RedisConfig>) -> KalamcheResult<Self> {
    let config = config
      .as_ref()
      .ok_or(KalamcheErrorType::RedisNotConfigured)?;

    let client = redis::Client::open(config.connection.clone())?;
    let conn = client.get_multiplexed_tokio_connection().await?;

    Ok(Self(conn))
  }

  pub async fn set<T: Serialize>(
    &self,
    key: &str,
    value: T,
    ttl: Option<usize>,
  ) -> KalamcheResult<()> {
    let json_value = serde_json::to_string(&value)?;

    let mut pool = self.0.clone();
    let _: () = pool
      .set_ex(
        &Self::namespace(key),
        &json_value,
        ttl.unwrap_or(DEFAULT_CACHE_TTL) as u64,
      )
      .await?;

    Ok(())
  }

  fn namespace(key: &str) -> String {
    format!("kalamche:{}", key)
  }
}

impl Deref for RedisCache {
  type Target = MultiplexedConnection;

  fn deref(&self) -> &Self::Target {
    &self.0
  }
}
