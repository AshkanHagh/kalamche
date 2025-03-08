use config::auth::oauth::OAuthStrategy;
use std::sync::Arc;

pub struct AdaptersContainer {
  // pub password_hasher: Arc<dyn PasswordHashStrategy>,
  pub oauth: Arc<dyn OAuthStrategy + Send + Sync>,
  // pub token_cache: Arc<dyn TokenCacheStrategy>,
  // pub cache: Arc<dyn CacheStrategy<T>>,
}

impl AdaptersContainer {
  pub fn new(oauth: Arc<dyn OAuthStrategy + Send + Sync>) -> Self {
    Self { oauth }
  }
}
