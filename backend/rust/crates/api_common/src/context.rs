use db_schema::connection::{ActualDbPool, DbPool};
use reqwest::Client;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use utils::{
  image::{S3ImageClient, UploadProgress},
  oauth::OAuthManager,
  payment::PaymentClient,
};

pub struct KalamcheContext {
  pub pool: ActualDbPool,
  pub request: Arc<Client>,
  pub oauth: Arc<OAuthManager>,
  pub payment_client: Arc<PaymentClient>,
  pub upload_progress: Arc<Mutex<HashMap<String, UploadProgress>>>,
  pub image_client: Arc<S3ImageClient>,
}

impl KalamcheContext {
  pub fn new(
    pool: ActualDbPool,
    client: Client,
    oauth: OAuthManager,
    payment: PaymentClient,
    image_client: S3ImageClient,
  ) -> Self {
    Self {
      pool,
      request: Arc::new(client.clone()),
      oauth: Arc::new(oauth),
      payment_client: Arc::new(payment),
      upload_progress: Arc::new(Mutex::new(HashMap::new())),
      image_client: Arc::new(image_client),
    }
  }

  pub fn pool(&self) -> DbPool<'_> {
    DbPool::Pool(&self.pool)
  }

  pub fn inner_pool(&self) -> &ActualDbPool {
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
