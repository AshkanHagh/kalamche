use database::connection::Database;
use reqwest::Client;
use std::sync::Arc;

use crate::containter::AdaptersContainer;

pub struct KalamcheContext {
  pub pool: Database,
  pub client: Arc<Client>,
  pub adapters: Arc<AdaptersContainer>,
}

impl KalamcheContext {
  pub fn new(pool: Database, client: Client, adapters: AdaptersContainer) -> Self {
    Self {
      client: Arc::new(client.clone()),
      pool,
      adapters: Arc::new(adapters),
    }
  }

  pub fn pool(&self) -> &Database {
    &self.pool
  }

  pub fn client(&self) -> &Client {
    &self.client
  }
}
