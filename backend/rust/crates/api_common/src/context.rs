use database::connection::Database;
use reqwest::Client;
use std::sync::Arc;
use utils::{oauth::OAuthManager, payment::PaymentClient};

pub struct KalamcheContext {
  pub pool: Database,
  pub request: Arc<Client>,
  pub oauth: Arc<OAuthManager>,
  pub payment_client: Arc<PaymentClient>,
}

impl KalamcheContext {
  pub fn new(pool: Database, client: Client, oauth: OAuthManager, payment: PaymentClient) -> Self {
    Self {
      pool,
      request: Arc::new(client.clone()),
      oauth: Arc::new(oauth),
      payment_client: Arc::new(payment),
    }
  }

  pub fn pool(&self) -> &Database {
    &self.pool
  }

  pub fn request(&self) -> &Client {
    &self.request
  }

  pub fn oauth(&self) -> &OAuthManager {
    &self.oauth
  }

  pub fn payment_client(&self) -> &PaymentClient {
    &self.payment_client
  }
}
