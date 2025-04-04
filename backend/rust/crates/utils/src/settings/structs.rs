use serde::{Deserialize, Serialize};
use smart_default::SmartDefault;
use std::net::{IpAddr, Ipv4Addr};

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default, deny_unknown_fields)]
pub struct Settings {
  pub database: DatabaseConfig,

  #[default(None)]
  pub oauth_providers: Option<OAuthConfig>,

  #[default(Default::default())]
  pub email: EmailConfig,

  #[default(Default::default())]
  pub jwt: JwtConfig,

  #[default(Default::default())]
  pub payment: PaymentConfig,

  #[default("localhost")]
  pub hostname: String,

  #[default(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)))]
  pub bind: IpAddr,

  #[default(7319)]
  pub port: u16,

  #[default("http://localhost:7318")]
  pub allowed_origin_url: String,

  #[default(false)]
  pub tls_enabled: bool,
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
pub struct JwtConfig {
  #[default("access_token_secret")]
  pub at_secret: String,

  #[default("refresh_token_secret")]
  pub rt_secret: String,

  #[default(2)] // 2 day
  pub at_expiry: usize,

  #[default(15)] // 15m
  pub rt_expiry: usize,

  #[default(10)] // 10m
  pub verfication_expiry: usize,

  #[default("verification_token_secret")]
  pub verification_secret: String,

  #[default("http://localhost:7319")]
  pub verification_redirect_url: String,
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

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
#[serde(default)]
pub struct EmailConfig {
  #[default("kalamche.app@example.com")]
  pub email: String,

  #[default("localhost")]
  pub host: String,

  #[default(1025)]
  pub port: u16,

  // no user required
  #[default("")]
  pub user: String,

  // no password required
  #[default("")]
  pub password: String,

  #[default(false)]
  pub tls: bool,
}

#[derive(Debug, Deserialize, Serialize, SmartDefault)]
pub struct PaymentConfig {
  #[default("example")]
  pub secret: String,

  #[default("http://localhost:7319")]
  pub success_url: String,

  #[default("http://localhost:7319")]
  pub cancel_url: String,
}
