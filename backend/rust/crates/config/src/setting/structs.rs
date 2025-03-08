use std::net::IpAddr;

pub struct Settings {
  pub database: DatabaseConfig,
  pub oauth: OAuthConfig,
  pub cache: CacheConfig,
  pub hostname: String,
  pub bind: IpAddr,
  pub port: u16,
}

pub struct OAuthConfig {
  pub client_id: String,
  pub client_secret: String,
  pub redirect_url: String,
}

pub struct CacheConfig {
  pub connection: String,
}

pub struct DatabaseConfig {
  pub connection: String,
  pub pool_size: usize,
}
