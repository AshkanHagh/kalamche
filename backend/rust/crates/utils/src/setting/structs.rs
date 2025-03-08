use serde::{Deserialize, Serialize};
use smart_default::SmartDefault;
use std::net::{IpAddr, Ipv4Addr};

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default, deny_unknown_fields)]
pub struct Settings {
  pub database: DatabaseConfig,

  #[default(Some(Default::default()))]
  pub cache: Option<RedisConfig>,

  #[default(Some(Default::default()))]
  pub oauth: Option<OAuthConfig>,

  #[default("localhost")]
  pub hostname: String,

  #[default(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)))]
  pub bind: IpAddr,

  #[default(7319)]
  pub port: u16,

  #[default(false)]
  pub tls_enabled: bool,

  pub jwt: JwtConfig,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct DatabaseConfig {
  #[default("postgres://kalam:password@localhost/kalamche")]
  pub connection: String,
  #[default(10)]
  pub pool_size: usize,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct OAuthConfig {
  pub client_id: String,
  pub client_secret: String,
  pub redirect_url: String,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct RedisConfig {
  #[default("redis://localhost:6379")]
  pub connection: String,
  #[default(10)]
  pub pool_size: u32,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct JwtConfig {
  pub at_secret: String,
  pub rt_secret: String,
  #[default(24 * 60 * 60)]
  pub at_expiry: u64,
  #[default(30 * 24 * 60 * 60)]
  pub rt_expiry: u64,
}
