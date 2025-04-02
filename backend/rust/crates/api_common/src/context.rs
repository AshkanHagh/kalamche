use database::connection::Database;
use reqwest::Client;
use std::sync::Arc;
use utils::cache::RedisCache;

use crate::oauth_provider::OAuthManager;

pub struct KalamcheContext {
  pub pool: Database,
  pub request: Arc<Client>,
  pub cache: Arc<RedisCache>,
  pub oauth: Arc<OAuthManager>,
}

impl KalamcheContext {
  pub fn new(pool: Database, client: Client, cache: RedisCache, oauth: OAuthManager) -> Self {
    Self {
      request: Arc::new(client.clone()),
      oauth: Arc::new(oauth),
      cache: Arc::new(cache),
      pool,
    }
  }

  pub fn pool(&self) -> &Database {
    &self.pool
  }

  pub fn request(&self) -> &Client {
    &self.request
  }

  pub fn cache(&self) -> &RedisCache {
    &self.cache
  }

  pub fn oauth(&self) -> &OAuthManager {
    &self.oauth
  }
}
