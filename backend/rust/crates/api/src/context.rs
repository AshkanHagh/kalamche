use database::connection::Database;
use reqwest::Client;
use std::sync::Arc;
use utils::utils::{cache::RedisCache, oauth::GithubOAuth};

pub struct KalamcheContext {
  pub pool: Database,
  pub client: Arc<Client>,
  pub cache: Arc<RedisCache>,
  pub oauth: Arc<GithubOAuth>,
}

impl KalamcheContext {
  pub fn new(pool: Database, client: Client, cache: RedisCache, oauth: GithubOAuth) -> Self {
    Self {
      client: Arc::new(client.clone()),
      oauth: Arc::new(oauth),
      cache: Arc::new(cache),
      pool,
    }
  }

  pub fn pool(&self) -> &Database {
    &self.pool
  }

  pub fn client(&self) -> &Client {
    &self.client
  }
}
