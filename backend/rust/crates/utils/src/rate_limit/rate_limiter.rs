use moka::future::Cache;
use std::{
  net::IpAddr,
  time::{SystemTime, UNIX_EPOCH},
};
use strum::Display;
use uuid::Uuid;

use crate::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

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
  Payment,
}

#[derive(Clone)]
pub struct RateLimitChecker {
  pub action_type: ActionType,
  pub key: String,
  pub cache: Cache<String, u32>,
  pub bucket_config: BucketConfig,
}

impl RateLimitChecker {
  pub fn for_user(&mut self, user_id: Uuid) -> &mut Self {
    self.key = format!("user:{}", user_id);
    self
  }

  pub fn for_ip(&mut self, ip: &IpAddr) -> &mut Self {
    self.key = match ip {
      IpAddr::V4(ipv4) => format!("ipv4:{}", ipv4),
      IpAddr::V6(ipv6) => format!("ipv6:{}", ipv6),
    };

    self
  }

  pub async fn check(&mut self) -> KalamcheResult<()> {
    let bucket_key = format!("rate_limit:{}:{}", self.key, self.action_type.to_string());
    let last_checked_key = format!(
      "rate_last_checked:{}:{}",
      self.key,
      self.action_type.to_string()
    );

    let now = InstantSecs::now();
    let tokens = self.cache.get(&bucket_key).await;
    let last_checked = self.cache.get(&last_checked_key).await;

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
    self.cache.insert(bucket_key, new_tokens).await;
    self.cache.insert(last_checked_key, now.secs).await;

    Ok(())
  }
}
