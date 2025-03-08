use redis::aio::MultiplexedConnection;

use crate::{
  error::{KalamcheErrorType, KalamcheResult},
  setting::structs::RedisConfig,
};

pub struct RedisCache(pub MultiplexedConnection);

impl RedisCache {
  pub async fn new(config: &Option<RedisConfig>) -> KalamcheResult<Self> {
    let config = config
      .as_ref()
      .ok_or(KalamcheErrorType::RedisNotConfigured)?;

    let client = redis::Client::open(config.connection.clone())?;
    let conn = client.get_multiplexed_async_connection().await?;

    Ok(Self(conn))
  }

  pub fn set<T>(&self, key: &str, value: T) -> KalamcheResult<()> {
    todo!()
  }
}
