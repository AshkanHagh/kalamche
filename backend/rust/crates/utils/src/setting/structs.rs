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
  pub oauth_providers: Option<OAuthConfig>,

  #[default("localhost")]
  pub hostname: String,

  #[default(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)))]
  pub bind: IpAddr,

  #[default(7319)]
  pub port: u16,

  #[default(false)]
  pub tls_enabled: bool,

  #[default(Default::default())]
  pub jwt: JwtConfig,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct DatabaseConfig {
  #[default("postgresql://kalam:password@localhost:5432/kalamche")]
  pub connection: String,

  #[default(10)]
  pub pool_size: u32,

  #[default(10)]
  pub max_lifetime: u64,

  #[default(10)]
  pub connect_timeout: u64,

  #[default(10)]
  pub acquire_timeout: u64,

  #[default(10)]
  pub idle_timeout: u64,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct RedisConfig {
  #[default("redis://localhost:6379")]
  pub connection: String,
  #[default(0)]
  pub pool_size: u32,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct JwtConfig {
  #[default("randome jwt secret")]
  pub at_secret: String,

  #[default("randome jwt secret")]
  pub rt_secret: String,

  #[default(24 * 60 * 60)]
  pub at_expiry: usize,

  #[default(30 * 24 * 60 * 60)]
  pub rt_expiry: usize,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct OAuthConfig {
  #[default(None)]
  pub github: Option<OAuthProviderConfig>,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault, Clone)]
#[serde(default)]
pub struct OAuthProviderConfig {
  pub client_id: String,
  pub client_secret: String,
  pub redirect_url: String,
  pub auth_url: String,
  pub token_url: String,
  pub user_info_url: String,
  pub other_info_url: Option<String>,
}
