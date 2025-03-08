use std::{
  net::{IpAddr, Ipv4Addr},
  sync::LazyLock,
};
use structs::{DatabaseConfig, JwtConfig, OAuthConfig, RedisConfig, Settings};

pub mod structs;

pub static SETTINGS: LazyLock<Settings> = LazyLock::new(|| {
  if std::env::var("KALAMCHE_INITIALIZE_WITH_DEFAULT_SETTINGS").is_ok() {
    println!("KALAMCHE_INITIALIZE_WITH_DEFAULT_SETTINGS was set, any env file has been ignored.");
    Settings::default()
  } else {
    Settings::init()
  }
});

impl Settings {
  pub(crate) fn init() -> Self {
    Self {
      database: DatabaseConfig {
        connection: Self::get_var("DATABASE_URL"),
        pool_size: Self::get_var("DATABASE_POOL_SIZE").parse().unwrap(),
      },

      cache: Some(RedisConfig {
        connection: Self::get_var("REDIS_URL"),
        pool_size: 0,
      }),

      oauth: Some(OAuthConfig {
        client_id: Self::get_var("GITHUB_CLIENT_ID"),
        client_secret: Self::get_var("GITHUB_CLIENT_SECRET"),
        redirect_url: Self::get_var("GITHUB_REDIRECT_URL"),
      }),

      jwt: JwtConfig {
        rt_secret: Self::get_var("REFRESH_TOKEN_SECRET"),
        at_secret: Self::get_var("ACCESS_TOKEN_SECRET"),
        rt_expiry: Self::get_var("REFRESH_TOKEN_EXPIRY").parse().unwrap(),
        at_expiry: Self::get_var("ACCESS_TOKEN_EXPIRY").parse().unwrap(),
      },

      bind: IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)),
      hostname: "localhost".to_owned(),
      port: 7319,
      tls_enabled: false,
    }
  }

  pub fn get_database(&self) -> &DatabaseConfig {
    &self.database
  }

  pub fn get_cache(&self) -> &Option<RedisConfig> {
    &self.cache
  }

  pub fn get_oauth(&self) -> &Option<OAuthConfig> {
    &self.oauth
  }

  pub fn get_jwt(&self) -> &JwtConfig {
    &self.jwt
  }

  fn get_var(key: &str) -> String {
    dotenvy::var(key).expect(format!("ERROR: could not found env: {}", key).as_ref())
  }
}
