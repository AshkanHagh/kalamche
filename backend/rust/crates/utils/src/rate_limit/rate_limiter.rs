use redis::AsyncCommands;
use std::time::{SystemTime, UNIX_EPOCH};
use strum::Display;
use uuid::Uuid;

use crate::{
  cache::RedisCache,
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
};

#[derive(Debug, PartialEq, Clone, Copy)]
pub struct InstantSecs {
  pub secs: u32,
}

impl InstantSecs {
  pub fn now() -> Self {
    let now = SystemTime::now()
      .duration_since(UNIX_EPOCH)
      .unwrap()
      .as_secs();

    InstantSecs { secs: now as u32 }
  }
}

#[derive(PartialEq, Debug, Clone, Copy)]
struct Bucket {
  last_checked: InstantSecs,
  tokens: u32,
}

#[derive(PartialEq, Debug, Copy, Clone)]
pub struct BucketConfig {
  pub capacity: u32,
  pub secs_to_refill: u32,
}

impl Bucket {
  fn update(self, now: InstantSecs, config: BucketConfig) -> Self {
    let secs_since_last_checked = now.secs.saturating_sub(self.last_checked.secs);

    // For `secs_since_last_checked` seconds, the amount of tokens increases by `capacity` every
    // `secs_to_refill` seconds. The amount of tokens added per second is `capacity /
    // secs_to_refill`. The expression below is like `secs_since_last_checked * (capacity /
    // secs_to_refill)` but with precision and non-overflowing multiplication.
    let added_tokens =
      (secs_since_last_checked as u64 * config.capacity as u64) / config.secs_to_refill as u64;

    // The amount of tokens there would be if the bucket had infinite capacity
    let unbounded_tokens = self.tokens.saturating_add(added_tokens as u32);

    // Bucket stops filling when capacity is reached
    let tokens = std::cmp::min(unbounded_tokens, config.capacity);

    Bucket {
      tokens,
      last_checked: now,
    }
  }
}

#[derive(Debug, Display, PartialEq, Eq, Hash, Clone)]
pub enum ActionType {
  Register,
  Search,
  Product,
  Image,
}

#[derive(Debug, Clone)]
pub struct RateLimitChecker {
  pub action_type: ActionType,
  pub bucket_config: BucketConfig,
  pub redis_pool: RedisCache,
  pub key: String,
}

impl RateLimitChecker {
  pub fn for_user(&mut self, user_id: Uuid) -> &mut Self {
    self.key = format!("user:{}", user_id);
    self
  }

  pub fn for_ip(&mut self, ip: &str) -> &mut Self {
    self.key = format!("ip:{}", ip);
    self
  }

  pub async fn check(&mut self) -> KalamcheResult<()> {
    let bucket_key = format!("rate_limit:{}:{}", self.key, self.action_type.to_string());
    let last_checked_key = format!(
      "rate_last_checked:{}:{}",
      self.key,
      self.action_type.to_string()
    );

    let pool = &mut self.redis_pool.0;

    let now = InstantSecs::now();
    let (tokens, last_checked): (Option<u32>, Option<u32>) =
      pool.mget((&bucket_key, &last_checked_key)).await?;

    let bucket = Bucket {
      tokens: tokens.unwrap_or(self.bucket_config.capacity),
      last_checked: InstantSecs {
        secs: last_checked.unwrap_or(now.secs),
      },
    };

    let updated_bucket = bucket.update(now, self.bucket_config);
    if updated_bucket.tokens == 0 {
      return Err(KalamcheError::from(KalamcheErrorType::RateLimitError));
    }

    let new_tokens = updated_bucket.tokens - 1;
    let _: () = pool
      .mset(&[(&bucket_key, new_tokens), (&last_checked_key, now.secs)])
      .await?;

    Ok(())
  }
}
