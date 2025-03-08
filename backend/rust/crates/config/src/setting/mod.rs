use dotenvy::var;
use std::{
  net::{IpAddr, Ipv4Addr},
  sync::LazyLock,
};
use structs::{CacheConfig, DatabaseConfig, OAuthConfig, Settings};

pub mod structs;

pub static SETTINGS: LazyLock<Settings> = LazyLock::new(|| Settings::init());

impl Settings {
  pub(crate) fn init() -> Self {
    Self {
      bind: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
      hostname: "localhost".to_owned(),
      port: 7319,
      database: DatabaseConfig {
        connection: var("DATABASE_URL").expect("ERROR: missing DATABASE_URL"),
        pool_size: 8,
      },
      oauth: OAuthConfig {
        client_id: var("GITHUB_CLIENT_ID").expect("ERROR: missing GITHUB_CLIENT_ID"),
        client_secret: var("GITHUB_CLIENT_SECRET").expect("ERROR: missing GITHUB_CLIENT_SECRET"),
        redirect_url: var("OAUTH_REDIRECT_URL").expect("ERROR: missing OAUTH_REDIRECT_URL"),
      },
      cache: CacheConfig {
        connection: var("REDIS_URL").expect("ERROR: missing REDIS_URL"),
      },
    }
  }
}
